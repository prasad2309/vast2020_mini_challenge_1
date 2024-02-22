function travelScatterPlotMain() {
    templateScatterTravelSvg = d3.select("#template_scatter_travel_svg");
    subgraphScatterTravelSvg = d3.select("#subgraph_scatter_travel_svg");
    scatter_travel_width = +subgraphScatterTravelSvg.style('width').replace('px','');
    scatter_travel_height = +subgraphScatterTravelSvg.style('height').replace('px','');
    scatter_travel_margin = { top:40, bottom: 50, right: 20, left: 60 };
    scatter_travel_innerWidth = scatter_travel_width - scatter_travel_margin.left - scatter_travel_margin.right;
    scatter_travel_innerHeight = scatter_travel_height - scatter_travel_margin.top - scatter_travel_margin.bottom; 
    drawScatterTravelChart();
    drawSubgraphScatterTravelChart();
}

function drawScatterTravelChart(){

    //Tooltip
    scatterTooltip = d3.select(".scatterTravelHistoryContainer")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position","absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "10px");

    var templateScatterG = templateScatterTravelSvg.append('g').attr('transform', `translate(${scatter_travel_margin.left}, ${scatter_travel_margin.top})`);

     //Get weights for only edge type 6
     var filteredTemplateData = templateData.filter(function(item) {
        return item.eType === "6";
      });
    // console.log(filteredTemplateData)

   //Getting unique source IDs        
   var templateSourceIDs = filteredTemplateData.map(d => +d["Source"]);
   templateSourceIDs.sort();
   templateSourceIDs = [... new Set(templateSourceIDs)];

    //SubGraph Axis
    var xScale =  d3.scaleLinear()
                    .domain([0, d3.max(filteredTemplateData, d => d["Weight"])]) 
                    .range([0, scatter_travel_innerWidth]); 


    var yScale = d3.scaleBand()
                    .domain(templateSourceIDs)
                    .range([scatter_travel_innerHeight, 0 ]);
        
    var xAxis = templateScatterG.append("g")
                .attr("transform", `translate(0,${scatter_travel_innerHeight})`)
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .style("text-anchor", "middle")
    
    var yAxis = templateScatterG.append("g")
                .call(d3.axisLeft(yScale))
                .selectAll("text")
                .style("text-anchor", "middle")
                .attr("transform", "translate(-8, 0)");

    var flagImages = {
        "0": "components/scatter-travel-history/flag_png/canada.png",
        "1": "components/scatter-travel-history/flag_png/germany.png",
        "2": "components/scatter-travel-history/flag_png/india.png",
        "3": "components/scatter-travel-history/flag_png/SA.png",
        "4": "components/scatter-travel-history/flag_png/UK.png",
        "5": "components/scatter-travel-history/flag_png/USA.png",
      };

    templateScatterG.selectAll("image")
      .data(filteredTemplateData)
      .enter()
      .append("image")
      .attr("x", d => xScale(+d["Weight"]) - 9)
      .attr("y", d => yScale(+d["Source"]) + 18)
      .attr("width", 20)
      .attr("height", 20)
      .attr("xlink:href", d => flagImages[+d["TargetLocation"]])
      .on("mouseover", function(event,d){            
        scatterTooltip
            .html("Source ID: " + d["Source"] + "<br>" + "Target: " + d["Target"] + "<br>" + "Source Loc: " + d["SourceLocation"]+ "<br>" + "Destination Loc: " + d["TargetLocation"] + "<br>" + "Weight: " + d["Weight"])
            .style("opacity", 1)
            .style("left", (event.pageX) + 15 + "px")
            .style("top", (event.pageY) - 40 + "px");
        })
        .on("mousemove", function(event,d){
            scatterTooltip
                .style('top', event.pageY - 40 + 'px')
                .style('left', event.pageX + 15 + 'px');
        })
        .on("mouseleave", function(d,i){
            scatterTooltip.style("opacity", 0);
        });


    //Axis-labels
    templateScatterG.append("text")
    .attr("transform",`translate(${scatter_travel_innerWidth/2 - 90}, ${scatter_travel_innerHeight + 15})`)
    .attr("x", -10)
    .attr("y", 20)
    .attr("dy", "0.7em")
    .text("Duration of stay in days ");

    templateScatterG.append('text')
    .attr('transform','rotate(-90)')
    .attr('x',-scatter_travel_innerHeight/2 - 15)
    .attr('y',-49)
    .attr('text-anchor','middle')
    .text('Source ID')

    templateScatterG.append("text")
    .attr("x", (scatter_travel_innerWidth / 2))
    .attr("y", 0 - (scatter_travel_margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Travel History Scatter Plot for Template Graph");

}

function drawSubgraphScatterTravelChart() {
    console.log("drawSubgraphScatterTravelChart")
    subgraphScatterTravelSvg.selectAll('g').remove();
    var subgraphScatterGT = subgraphScatterTravelSvg.append('g').attr('transform', `translate(${scatter_travel_margin.left}, ${scatter_travel_margin.top})`);

    let scatterLabel = document.getElementById("similarSeedSelect").value;

    let selectedSubgraphData = currentSimilarNodes;


    //Get weights for only edge type 6
    var filteredData = selectedSubgraphData.filter(function(item) {
        return item.eType === "6";
      });
    // console.log(filteredData)

   //Getting unique source IDs        
   var subgraphSourceIDs = filteredData.map(d => +d["Source"]);
   subgraphSourceIDs.sort();
   subgraphSourceIDs = [... new Set(subgraphSourceIDs)];

    //SubGraph Axis
    var xScale =  d3.scaleLinear()
                    .domain([0, d3.max(filteredData, d => d["Weight"])]) 
                    .range([0, scatter_travel_innerWidth]); 


    var yScale = d3.scaleBand()
                    .domain(subgraphSourceIDs)
                    .range([scatter_travel_innerHeight, 0 ]);
        
    var xAxis = subgraphScatterGT.append("g")
                .attr("transform", `translate(0,${scatter_travel_innerHeight})`)
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .style("text-anchor", "middle")
    
    var yAxis = subgraphScatterGT.append("g")
                .call(d3.axisLeft(yScale))
                .selectAll("text")
                .style("text-anchor", "middle")
                .attr("transform", "translate(-18, 0)");

    var flagImages = {
        "0": "components/scatter-travel-history/flag_png/canada.png",
        "1": "components/scatter-travel-history/flag_png/germany.png",
        "2": "components/scatter-travel-history/flag_png/india.png",
        "3": "components/scatter-travel-history/flag_png/SA.png",
        "4": "components/scatter-travel-history/flag_png/UK.png",
        "5": "components/scatter-travel-history/flag_png/USA.png",
      };

    subgraphScatterGT.selectAll("image")
      .data(filteredData)
      .enter()
      .append("image")
      .attr("x", d => xScale(+d["Weight"]) - 9)
      .attr("y", d => yScale(+d["Source"]) + 18)
      .attr("width", 20)
      .attr("height", 20)
      .attr("xlink:href", d => flagImages[+d["TargetLocation"]])
      .on("mouseover", function(event,d){            
        scatterTooltip
            .html("Source ID: " + d["Source"] + "<br>" + "Target: " + d["Target"] + "<br>" + "Source Loc: " + d["SourceLocation"]+ "<br>" + "Destination Loc: " + d["TargetLocation"] + "<br>" + "Weight: " + d["Weight"])
            .style("opacity", 1)
            .style("left", (event.pageX) + 15 + "px")
            .style("top", (event.pageY) - 40 + "px");
        })
        .on("mousemove", function(event,d){
            scatterTooltip
                .style('top', event.pageY - 40 + 'px')
                .style('left', event.pageX + 15 + 'px');
        })
        .on("mouseleave", function(d,i){
            scatterTooltip.style("opacity", 0);
        });


    //Axis-labels
    subgraphScatterGT.append("text")
    .attr("transform",`translate(${scatter_travel_innerWidth/2 - 90}, ${scatter_travel_innerHeight + 15})`)
    .attr("x", -80)
    .attr("y", 20)
    .attr("dy", "0.7em")
    .text("Duration of stay in days " + scatterLabel);

    subgraphScatterGT.append('text')
    .attr('transform','rotate(-90)')
    .attr('x',-scatter_travel_innerHeight/2 - 15)
    .attr('y',-49)
    .attr('text-anchor','middle')
    .text('Source ID')

    subgraphScatterGT.append("text")
    .attr("x", (scatter_travel_innerWidth / 2))
    .attr("y", 0 - (scatter_travel_margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Travel History Scatter Plot for " + scatterLabel);

}
