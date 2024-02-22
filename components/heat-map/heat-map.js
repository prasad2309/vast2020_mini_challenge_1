let templateHeatMapSvg, subGraphHeatMapSvg, heat_map_width, heat_map_height, heat_map_innerHeight, heat_map_innerWidth, heat_map_margin, heat_map_offset, checkedSpendings;

function heatMapMain() {
  // console.log("HEAT MAP MAIN");
  // console.log(nodeTypesMap);
  // console.log(demographicCategoriesMap);

  templateHeatMapSvg = d3.select("#template_heat_map_svg");
  subGraphHeatMapSvg = d3.select("#subgraph_heat_map_svg");

  heat_map_width = +templateHeatMapSvg.style('width').replace('px','');
  heat_map_height = +subGraphHeatMapSvg.style('height').replace('px','');
  heat_map_margin = { top:20, bottom: 60, right: 0, left: 40 };
  heat_map_innerWidth = heat_map_width - heat_map_margin.left - heat_map_margin.right;
  heat_map_innerHeight = heat_map_height - heat_map_margin.top - heat_map_margin.bottom; 
  heat_map_offset = 5;

  VirtualSelect.init({
		ele: "#selectSpendingType",
		silentInitialValueSet: false,
	});
  document.querySelector("#selectSpendingType").toggleSelectAll(true);

  document
		.querySelector("#selectSpendingType")
		.addEventListener("change", function () {
			checkedSpendings = this.value;
      drawHeatMap();
		});
}


function drawHeatMap() {
  // console.log("DRAWING HEAT MAP");
  subGraphHeatMapSvg.selectAll('g').remove();
  subGraphHeatMapG = subGraphHeatMapSvg.append('g').attr('transform', `translate(${heat_map_margin.left}, ${heat_map_margin.top})`);
  templateHeatMapSvg.selectAll('g').remove();
  templateHeatMapG = templateHeatMapSvg.append('g').attr('transform', `translate(${heat_map_margin.left}, ${heat_map_margin.top})`);

  //Tooltip
  const heatMapTooltip = d3.select(".heatMapContainer")
                          .append("div")
                          .style("opacity", 0)
                          .attr("class", "tooltip")
                          .style("position","absolute")
                          .style("background-color", "white")
                          .style("border", "solid")
                          .style("border-width", "2px")
                          .style("border-radius", "5px")
                          .style("padding", "10px");


  let heatMapLabel = document.getElementById("similarSeedSelect").value;

  let heatmapData = [];
  let filteredHeatmapDataSubGraph = [];
  // if (selectedSubgraph === "subGraph1Data") {
  //     heatmapData = subgraph1Data;
  //     heatMapLabel = "Subgraph 1";
  // } else if (selectedSubgraph == 'subGraph2Data') {
  //     heatmapData = subgraph2Data;
  //     heatMapLabel = "Subgraph 2";
  // } else if (selectedSubgraph == 'subGraph3Data') {
  //     heatmapData = subgraph3Data;
  //     heatMapLabel = "Subgraph 3";
  // } else if (selectedSubgraph == 'subGraph4Data') {
  //     heatmapData = subgraph4Data;
  //     heatMapLabel = "Subgraph 4";
  // } else if (selectedSubgraph == 'subGraph5Data') {
  //     heatmapData = subgraph5Data;
  //     heatMapLabel = "Subgraph 5";
  // }
  heatmapData = currentSimilarNodes;

  // PLOTTING SUBGRAPH
  subGraphHeatMapSvg.selectAll('text').remove();
  // Filter data by etype = 5 and source as person
  filteredHeatmapDataSubGraph = heatmapData
                                  .filter(d => d["eType"] === "5" && nodeTypesMap.get(d["Source"]) === "1" && checkedSpendings.includes(demographicCategoriesMap.get(d["Target"])))
                                  .sort((d1, d2) => d1["Source"] - d2["Source"]);
  // console.log(filteredHeatmapDataSubGraph);

  const yAxisLabelsSubgraph = Array.from(new Set(filteredHeatmapDataSubGraph.map(d => d["Target"])));
  // console.log(yAxisLabelsSubgraph)
  // X Axis - Source NodeID
  const xScale = d3.scaleBand()
              .domain(Array.from(new Set(filteredHeatmapDataSubGraph.map(d => d["Source"]))))
              .range([0,heat_map_innerWidth])
              .padding(0.05);

  subGraphHeatMapG.append("g")
              .attr("class","x-axis")
              .attr("transform", `translate(0,${heat_map_innerHeight})`)
              .call(d3.axisBottom(xScale))
              .selectAll("text")
              .style("text-anchor", "end")
              .attr("transform", "rotate(-45)");

  // Y Axis - demographicCategoriesMap values
  const yScale = d3.scaleBand()
                  .domain(Array.from(demographicCategoriesMap.values()))
                  .range([heat_map_innerHeight, 0])
                  .padding(0.2);

  subGraphHeatMapG.append("g")
                  .attr("class","y-axis")
                  .call(d3.axisLeft(yScale))
                  .selectAll("text")
                  .attr("transform", "rotate(-45) translate(0, -5)")
                  .style("text-anchor", "end")
                  .style("font-size", "8px");

  const weightScale = d3.scaleSqrt()
                        .domain([d3.min(filteredHeatmapDataSubGraph, d => +d["Weight"]), d3.max(filteredHeatmapDataSubGraph, d => +d["Weight"])])
                        .range([0, 300]);
// console.log(d3.min(filteredHeatmapDataSubGraph, d => +d["Weight"]))
  const myColor = d3.scaleSequential()
                  .interpolator(d3.interpolateInferno)
                  .domain([d3.min(filteredHeatmapDataSubGraph, d => d["Weight"]), d3.max(filteredHeatmapDataSubGraph, d => d["Weight"])])
                  .range(["white", "green"]);

  const colorScalesSubGraph = yAxisLabelsSubgraph.map(label => d3.scaleLinear().domain([0, 8000]).range(["white", "green"]));
  
  subGraphHeatMapSvg.selectAll("rect").remove();
  subGraphHeatMapSvg.selectAll()
                    .data(filteredHeatmapDataSubGraph, d => d["Source"] + ":" + demographicCategoriesMap.get(d["Target"]))
                    .join("rect")
                    .attr("x", d => xScale(d["Source"]) + heat_map_margin.left)
                    .attr("y", d => yScale(demographicCategoriesMap.get(d["Target"])) + 20)
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("width", xScale.bandwidth() )
                    .attr("height", yScale.bandwidth() )
                    .style("fill", function(d) { 
                      // return myColor(weightScale(+d["Weight"]))
                      const rowIndex = yAxisLabelsSubgraph.indexOf(d["Target"]);
                      return colorScalesSubGraph[rowIndex](+d["Weight"]);
                    })
                    .on("mouseover", function(event,d){            
                      heatMapTooltip
                          .html("Source: " + d["Source"] + "<br>" + "Category: " + demographicCategoriesMap.get(d["Target"]) + "<br>" + "Spendings: " + d["Weight"])
                          .style("opacity", 1)
                          .style("left", (event.pageX) + 15 + "px")
                          .style("top", (event.pageY) - 40 + "px");
                      })
                      .on("mousemove", function(event,d){
                        heatMapTooltip
                              .style('top', event.pageY - 40 + 'px')
                              .style('left', event.pageX + 15 + 'px');
                      })
                      .on("mouseleave", function(d,i){
                        heatMapTooltip.style("opacity", 0);
                      });

                      subGraphHeatMapSvg.exit().style("display", "none");
  // PLOTTING TEMPLATE GRAPH
  templateHeatMapSvg.selectAll('text').remove();
  const filteredTemplateData = templateData
                                .filter(d => d["eType"] === "5" && templateNodeTypesMap.get(d["Source"]) === "1" && checkedSpendings.includes(demographicCategoriesMap.get(d["Target"])))
                                .sort((d1, d2) => d1["Source"] - d2["Source"]);
  // console.log(filteredTemplateData);
  const yAxisLabelsTemplate = Array.from(new Set(filteredTemplateData.map(d => d["Target"])));
  // console.log(yAxisLabelsTemplate);

  const xScale_template = d3.scaleBand()
              .domain(Array.from(new Set(filteredTemplateData.map(d => d["Source"]))))
              .range([0,heat_map_innerWidth])
              .padding(0.05);

  templateHeatMapG.append("g")
              .attr("class","x-axis")
              .attr("transform", `translate(0,${heat_map_innerHeight})`)
              .call(d3.axisBottom(xScale_template))
              .selectAll("text")
              .style("text-anchor", "middle");
              // .attr("transform", "rotate(-45) translate(0, 10)");

  // Y Axis - demographicCategoriesMap values
  const yScale_template = d3.scaleBand()
                  .domain(Array.from(demographicCategoriesMap.values()))
                  .range([heat_map_innerHeight, 0])
                  .padding(0.2);

  templateHeatMapG.append("g")
                  .attr("class","y-axis")
                  .call(d3.axisLeft(yScale_template))
                  .selectAll("text")
                  .attr("transform", "rotate(-45) translate(0, -5)")
                  .style("text-anchor", "end")
                  .style("font-size", "8px");

  // const weightScale_template = d3.scaleSqrt()
  //                       .domain([d3.min(filteredTemplateData, d => d["Weight"]), d3.max(filteredTemplateData, d => d["Weight"])])
  //                       .range([0, 8000]);

  // const myColor_template = d3.scaleSequential()
  //                 .interpolator(d3.interpolateInferno)
  //                 .domain([d3.min(filteredTemplateData, d => d["Weight"]), d3.max(filteredTemplateData, d => d["Weight"])])
  //                 .range(["white", "green"]);

  const colorScalesTemplate = yAxisLabelsTemplate.map(label => d3.scaleLinear().domain([0, 8000]).range(["white", "green"]));
  
  templateHeatMapSvg.selectAll("rect").remove();
  templateHeatMapSvg.selectAll()
                    .data(filteredTemplateData, d => d["Source"] + ":" + demographicCategoriesMap.get(d["Target"]))
                    .join("rect")
                    .attr("x", d => xScale_template(d["Source"]) + heat_map_margin.left)
                    .attr("y", d => yScale_template(demographicCategoriesMap.get(d["Target"])) + 20)
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("width", xScale_template.bandwidth() )
                    .attr("height", yScale_template.bandwidth() )
                    .style("fill", function(d) { 
                      // return myColor_template(weightScale_template(d["Weight"]))
                      const rowIndex = yAxisLabelsTemplate.indexOf(d["Target"]);
                      return colorScalesTemplate[rowIndex](+d["Weight"]);
                    })
                    .on("mouseover", function(event,d){            
                      heatMapTooltip
                          .html("Source: " + d["Source"] + "<br>" + "Category: " + demographicCategoriesMap.get(d["Target"]) + "<br>" + "Spendings: " + d["Weight"])
                          .style("opacity", 1)
                          .style("left", (event.pageX) + 15 + "px")
                          .style("top", (event.pageY) - 40 + "px");
                      })
                      .on("mousemove", function(event,d){
                        heatMapTooltip
                              .style('top', event.pageY - 40 + 'px')
                              .style('left', event.pageX + 15 + 'px');
                      })
                      .on("mouseleave", function(d,i){
                        heatMapTooltip.style("opacity", 0);
                      });
   
  //Axis-labels
  subGraphHeatMapSvg.append("text")
                    .attr("x", heat_map_innerWidth/2 - 100)
                    .attr("y", heat_map_innerHeight + 65)
                    .attr("dy", "0.7em")
                    .text(`Source ID: ${heatMapLabel}`);

  subGraphHeatMapSvg.append('text')
                    .attr('transform','rotate(-90)')
                    .attr('x', -heat_map_innerHeight/2 - 60)
                    .attr('y', heat_map_margin.left - 90)
                    .attr("dy", "0.7em")
                    // .attr('text-anchor','middle')
                    .text('Spending Categories');

  templateHeatMapSvg.append("text")
                    .attr("x", heat_map_innerWidth/2 - 60)
                    .attr("y", heat_map_innerHeight + 65)
                    .attr("dy", "0.7em")
                    .text("Source ID: Template");
                    
  templateHeatMapSvg.append('text')
                    .attr('transform','rotate(-90)')
                    .attr('x', -heat_map_innerHeight/2 - 60)
                    .attr('y', heat_map_margin.left - 90)
                    .attr("dy", "0.7em")
                    // .attr('text-anchor','middle')
                    .text('Spending Categories');                             
}