let templateArcSvg, subgraphArcSvg , arc_width, arc_height, arc_innerHeight, arc_innerWidth, arc_margin, arcTooltip, arcNodes, n;
let selectedSeedInput;

var colorScale = d3.scaleOrdinal()
    .domain(["1", "2", "3", "4", "5"]) 
    .range(["#4E79A7", "#F28E2B", "#EDC948","#E15759","#59A14F"]);


function drawArcLegend() {
	console.log("Drawing legend");
	var nodeColors = [
    "/assets/images/1.svg",
    "/assets/images/2.svg",
    "/assets/images/3.svg",
    "/assets/images/4.svg",
    "/assets/images/5.svg",
  ];

	var legendCategories = [
		"Node 1: Person",
		"Node 2: Procurement",
		"Node 3: Document",
		"Node 4: Financial",
		"Node 5: Country",
	];
	var legendColorScale = d3
		.scaleOrdinal()
		.domain(legendCategories)
		.range(nodeColors);

	var legendContainer = d3.select("#arc_color_legend");

	var legend = legendContainer.append("g").attr("class", "legend");

	var legendWidth = legendCategories.length * 200;

	var legendX =
		(legendContainer.node().getBoundingClientRect().width - legendWidth) / 2;
	var legendY = 20;

	legend.attr("transform", "translate(" + legendX + "," + legendY + ")");

	// Create colored rectangles and labels for each category in the legend
	var legendItems = legend
		.selectAll(".legend-item")
		.data(legendCategories)
		.enter()
		.append("g")
		.attr("class", "legend-item")
		.attr("transform", function (d, i) {
			return "translate(" + i * 200 + ", 0)"; // Adjust the spacing between legend items
		});

    legendItems
		.append("image")
		.attr("xlink:href", function (d, i) {
			return nodeColors[i];
		})
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 20)
		.attr("height", 20);

	legendItems
		.append("text")
		.attr("x", 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "start")
		.text(function (d) {
			return d;
		});
}



function arcDiagramMain() {
  seedArcSvg = d3.select("#seed_arc_diagram_svg");
  templateArcSvg = d3.select("#template_arc_diagram_svg");

  arcData = []
  let seedSelectInput = document.getElementById("seedSelect");
  centerNode = Number(seedSelectInput.selectedOptions[0].value.split("-")[0])
  selectedSeedInput = seedSelectInput.selectedOptions[0].innerText;
  
  arcData = templateData;
    if (selectedSeedInput === "Seed Graph 1") {
      arcData = seedDataPruned1;
      document.getElementById("seed-similarity").innerHTML = "56.41%; Node: 41 - 24.58%";
    }
    if (selectedSeedInput === "Seed Graph 2") {
      arcData = seedDataPruned2;
      document.getElementById("seed-similarity").innerHTML = "42.95%; Node: 56 - 58.09%";
    }
    if (selectedSeedInput === "Seed Graph 3") {
      arcData = seedDataPruned3;
      document.getElementById("seed-similarity").innerHTML = "60.26%; Node: 41 - 30.02%";
    }
    
    let fn = []
    for (i = 0; i < arcData.length; i++){
      if ((Number(arcData[i]["similarity"])>0) || (i%30==0)) {
        fn.push(arcData[i])
      }
    }
    arcData = fn;
  
    arcData = arcData.sort(function (a, b) {
          if (a["Time"] < b["Time"]) {
              return -1;
          }
          if (a["Time"] > b["Time"]) {
              return 1;
          }

          if (a["eType"] < b["eType"]) {
              return -1;
          }
          if (a["eType"] > b["eType"]) {
              return 1;
          }

          return 0;
      });

  drawArcLegend();
  dataLoad(seedArcSvg, arcData, "Seed")
  dataLoad(templateArcSvg, templateData, "Template")

}

function dataLoad(ArcSvg, data, graphType) {

    // subgraphArcSvg = d3.select("#subgraph_scatter_svg");
    arc_width = +ArcSvg.style('width').replace('px','');
    arc_height = +ArcSvg.style('height').replace('px','');
    arc_margin = { top:20, bottom: 50, right: 20, left: 20 };
    arc_innerWidth = arc_width - arc_margin.left - arc_margin.right;
    arc_innerHeight = arc_height - arc_margin.top - arc_margin.bottom; 


    // List of node names
    arcNodes = data.map(d => +d["Source"]);
    arcNodes = [... new Set(arcNodes)];
    // console.log("Source arcNodes: ",arcNodes);

    // Extract unique values from the "Target" column
    var templateTargetIDs = data.map(d => +d["Target"]);
    templateTargetIDs = [...new Set(templateTargetIDs)];

    // Add unique "Target" IDs to templateSourceIDs if not already present
    templateTargetIDs.forEach(targetID => {
        if (!arcNodes.includes(targetID)) {
            arcNodes.push(targetID);
        }
    });
    // arcNodes.sort();

    n = [];
    arcNodes.forEach(d => n.push([d]));
    // console.log(n);
    // console.log(arcNodes);

    drawArcChart(ArcSvg, data, graphType);
}

const getLinkColor = (source) => {
  if ((source === 41 && selectedSeedInput === "Seed Graph 1" ) || (source === 56 && selectedSeedInput === "Seed Graph 2" ) || (source === 41 && selectedSeedInput === "Seed Graph 3" )) {
    return "#F29727"
  } else {
    return "#AF2655"
  }
}


function drawArcChart(ArcSvg, data, graphType){
  var templateArcG = ArcSvg.attr('transform', `translate(${arc_margin.left}, ${arc_margin.top})`);
  templateArcG.selectAll(".mynodes").remove()
  templateArcG.selectAll(".mylinks").remove()
  templateArcG.selectAll(".mylabels").remove()
  // templateArcG.selectAll('text').remove();
  //    seedArcSvg.selectAll('text').remove();

  const x = d3.scalePoint()
    .range([0, arc_innerWidth])
    .domain(arcNodes)
    .padding(0.2);

  // Add the circle for the nodes
  // const nodes = templateArcG
  //   .selectAll("mynodes")
  //   .data(n)             //CREATE A DIFFERENT OBJECT WITH NODE ID AND NAME MAYBE TO CREATE CIRCLES
  //   .join("circle")
  //   .attr("cx", d => x(d[0]))
  //   .attr("cy", arc_innerHeight-200)
  //   .attr("r", 6)
  //   .style("fill", "#A3B763")

    const nodes = templateArcG
    .selectAll("mynodes")
    .data(n)             //CREATE A DIFFERENT OBJECT WITH NODE ID AND NAME MAYBE TO CREATE CIRCLES
    .join("image")
    .attr("x", d => x(d[0]) - 7)
    .attr("y", arc_innerHeight-100)
    .attr("width", 15) 
    .attr("height", 15) 
    .attr("class","mynodes")
    // .attr("xlink:href", d => `assets/images/${templateNodeTypesMap.get((d[0]).toString())}.svg`)
    .attr("xlink:href", function(d){
      if(graphType === "Template"){
        return `assets/images/${templateNodeTypesMap.get((d[0]).toString())}.svg`
      }
      else{
        return `assets/images/${nodeTypesMap.get((d[0]).toString())}.svg`
      }
    }) 

    // .attr("fill", 'red') ;
   
  // And give them a label
  const labels = templateArcG
    .selectAll(".mylabels")
    .data(n)
    .join("text")
    .attr("x", d=>x(d[0]) - 7)
    .attr("y", arc_innerHeight-73)
    .text(d=>(d[0]))
    .style("text-anchor", "end")
    .attr("class","mylabels")
    .attr("transform", d => `rotate(-90, ${x(d[0])}, ${arc_innerHeight - 80})`)
    .style("font-size", "12px"); 

  // Add the links
  const links = templateArcG
    .selectAll('.mylinks')
    .data(data)
    .join('path')
    .attr("class", "mylinks")
    .attr('d', d=> {
      start = x(+d["Source"])    // X position of start node on the X axis
      end = x(+d["Target"])      // X position of end node
      return ['M', start, arc_innerHeight-100,    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
              'A',                            // This means we're gonna build an elliptical arc
              (start - end)/2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
              (start - end)/2, 0, 0, ',',
                start < end ? 1 : 0, end, ',', arc_innerHeight-100] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
                .join(' ');
      })
      .style("fill", "none")
    .attr("stroke", d=>getLinkColor(+d["Source"]))

     // Add the highlighting functionality
     nodes
     .on('mouseover', function (event, d) {

      var connectedNodes = data
        .filter(link => +link["Source"] === d[0] || +link["Target"] === d[0]);

      connectedNodes = connectedNodes.map(function(element){
        if(+element["Source"] === d[0]){
          return +element["Target"];
        }
        else if(+element["Target"] === d[0]){
          return +element["Source"]
        }
      });

      connectedNodes = [d[0],... new Set(connectedNodes)];

       nodes.style('opacity', node => {
         return connectedNodes.includes(node[0]) ? 1 : 0.1;
       });

       labels.style('opacity', node => {
        return connectedNodes.includes(node[0]) ? 1 : 0;
      });

       // Highlight the connections
       links
         .style('stroke', link => {
           if (+link["Source"] === d[0] || +link["Target"] === d[0]) {
             // Highlight the links
             return '#AF2655';
           } else {
             return '#ffffff';
           }
         })
         .style('stroke-width', link =>
           +link["Source"] === d[0] || +link["Target"] === d[0] ? 3 : 0
         );
     })
     .on('mouseout', function (event, d) {
       nodes.style('opacity', 1);  
       labels.style('opacity',1); 
      //  links.style('stroke', '#AF2655').style('stroke-width', '1');
      links.style("stroke", d=>getLinkColor(+d["Source"])).style('stroke-width', '1');

     });

     
    // text hover nodes
    templateArcG
      .append("text")
      .attr("text-anchor", "middle")
      .style("fill", "#B8B8B8")
      .style("font-size", "17px")
      .attr("x", 60)
      .attr("y", 20)
      .html("Hover on nodes")

    // templateArcG
    //   .append("text")
    //   .attr("x", arc_innerWidth/2 - 50)
    //   .attr("y", arc_innerHeight/2 + 400)
    //   .html("Source ID: Template");

    // seedArcSvg
    //   .append("text")
    //   .attr("x", arc_innerWidth/2 - 50)
    //   .attr("y", arc_innerHeight/2 + 400)
    //   .html(`Source ID: ${selectedSeedInput}`);

}