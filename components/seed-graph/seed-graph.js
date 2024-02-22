var svg = null;
var nodes = [];
var links = [];
var centerNode = 490041;
let eTypeColorScheme = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5, 6, 7])
    .range(["red", "blue", "green", "orange", "pink", "yellow", "purple"]); 

let activeNodes = [];

function seedChartMain (){
    // console.log("rendering seed graph")
    // drawSeedChart();
}

function removeDuplicates(arr) {
    let unique = [];
    arr.forEach(element => {
        if (!unique.includes(element)) {
            unique.push(element);
        }
    });
    return unique;
}

function removeNullNodes(arr) {
    filteredNodes = []
    for (i = 0; i < nodes.length; i++) { 
        if (nodes[i].id != undefined) {
            if ((activeNodes.length===0) || (activeNodes.includes(nodes[i].id))) {
                filteredNodes.push(nodes[i])
            }
            
        }
    }
    return filteredNodes
}

function findElementsUnder(mainDivId) {
    var mainDiv = document.getElementById(mainDivId);
    var mainDivRect = mainDiv.getBoundingClientRect();
    var allElements = document.body.getElementsByTagName("*");
    var underElements = [];

    for (var i = 0; i < allElements.length; i++) {
        var currentElement = allElements[i];
        var currentElementRect = currentElement.getBoundingClientRect();

        if (currentElement.id !== mainDivId &&
            currentElementRect.left < mainDivRect.right &&
            currentElementRect.right > mainDivRect.left &&
            currentElementRect.top < mainDivRect.bottom &&
            currentElementRect.bottom > mainDivRect.top) {

            underElements.push(currentElement.id);
        }
    }
    return underElements.filter(id => id); // Filter out empty ids
}


document.addEventListener('DOMContentLoaded', function() {
    var selectionTool = document.getElementById('selectionTool');
    var isDragging = false;
    var offset = { x: 0, y: 0 };

    selectionTool.addEventListener('mousedown', function(e) {
        isDragging = true;
        offset.x = e.clientX - selectionTool.getBoundingClientRect().left;
        offset.y = e.clientY - selectionTool.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            var mouseX = e.clientX;
            var mouseY = e.clientY;
            selectionTool.style.left = (mouseX - offset.x) + 'px';
            selectionTool.style.top = (mouseY - offset.y) + 'px';
        }
        
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        activeNodes = []
        let underMe = findElementsUnder("selectionTool")
        for (i = 0; i < underMe.length; i++){
            if (underMe[i].includes("node")) {
                activeNodes.push(Number(underMe[i].split("-")[1]))
            }
        }
        drawSeedChart()
    });
});

function drawSeedChart() {
    
    let seedSelectInput = document.getElementById("seedSelect");
    centerNode = Number(seedSelectInput.selectedOptions[0].value.split("-")[0])
    if (centerNode === 574136) {
        seedDataPruned = seedDataPruned3
    }

    let tmpNodes = []
    nodes = []
    links = []
    for (i = 0; i < seedDataPruned.length; i++){
        // console.log(seedDataPruned[i])
        if ((activeNodes.length === 0) || (activeNodes.includes(Number(seedDataPruned[i]["Source"])) && activeNodes.includes(Number(seedDataPruned[i]["Target"])))){
            links.push({ source: Number(seedDataPruned[i]["Source"]), target: Number(seedDataPruned[i]["Target"]), "hop": seedDataPruned[i]["depth"] + 1 })
            tmpNodes.push(seedDataPruned[i]["Source"])
            tmpNodes.push(seedDataPruned[i]["Target"])
        }
        
    }
    // console.log("links", links)
    tmpNodes = removeDuplicates(tmpNodes)
    for (i = 0; i < tmpNodes.length; i++) { 
        nodes.push({id: Number(tmpNodes[i])})
    }
    nodes = removeNullNodes(nodes);

    nodes.sort(function(a, b) {
        if (a.Time < b.Time) {
            return -1;
        }
        if (a.Time > b.Time) {
            return 1;
        }

        if (a.eType < b.eType) {
            return -1;
        }
        if (a.eType > b.eType) {
            return 1;
        }

        return 0; // if both are equal
    });

    // Creating the SVG container
    svg = d3.select("#seed_graph_svg");

    let width = +svg.style('width').replace('px','');
    let height = +svg.style('height').replace('px', '');
    
    // console.log(width, height)

    // Define the force simulation
    var simulation = d3.forceSimulation(nodes)
                    .force("link", d3.forceLink(links).id(d => d.id))
                    .force("charge", d3.forceManyBody().strength(-100))
                    .force("center", d3.forceCenter(width / 2, height / 2));

    // Render the links
    var link = svg
                // .append("g")
                // .attr("class", "links")
                .selectAll(".link")
                .data(links)
                .join("line")
                .attr("class", "link")
                .style("stroke-width", d => strokeWidth(d.hop));


    // Render the nodes
    // console.log("nodes", nodes)
    var node = svg
        // .append("g")
        // .attr("class", "nodes")
        .selectAll(".node")
        .data(nodes)
        .join("circle")
        .attr("r", d=>Number(d.id) === centerNode? 7 : 5)
        .attr("id", d => `node-${d.id}`)
        .attr("fill", d=>eTypeColorScheme(d["eType"]))
        .attr("class", (d) => {
            if (Number(d.id) === centerNode) {
                return "node centric-node"
            }
            return "node"
        })
        
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
    nodes.forEach(node => {
    if (Number(node.id) === centerNode) {
            node.fx = width / 2;
            node.fy = height / 2;
        }
    });
    
    // Add the simulation's tick event to update node and link positions
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}

// Drag functions for interactivity
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function strokeWidth(hop) {
    // Example: decrease stroke width as the hop increases
    return Math.max(1, 2 - hop);
}

