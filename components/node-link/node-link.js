let templateNodeLinkSvg,
	subgraph1NodeLinkSvg,
	subgraph2NodeLinkSvg,
	subgraph3NodeLinkSvg,
	subgraph4NodeLinkSvg,
	subgraph5NodeLinkSvg,
	nodeLinkTemplateData,
	nodeLinkSubgraph1Data,
	nodeLinkSubgraph2Data,
	nodeLinkSubgraph3Data,
	nodeLinkSubgraph4Data,
	nodeLinkSubgraph5Data,
	node_link_width,
	node_link_height,
	node_link_innerHeight,
	node_link_innerWidth,
	node_link_margin,
	node_list,
	nodeLinkNodes,
	nodeLinkTooltip;
let currentlySelectedSubgraphNodes = {
	Template: [],
	Subgraph1: [],
	Subgraph2: [],
	Subgraph3: [],
	Subgraph4: [],
	Subgraph5: [],
};
let nodesUnderSimilarityPath = {
	Template: [],
	Subgraph1: [],
	Subgraph2: [],
	Subgraph3: [],
	Subgraph4: [],
	Subgraph5: [],
};
const similarityThreshold = 0;

function nodeLinkMain() {
	templateNodeLinkSvg = d3.select("#template_node_link_svg");
	subgraph1NodeLinkSvg = d3.select("#subgraph1_node_link_svg");
	subgraph2NodeLinkSvg = d3.select("#subgraph2_node_link_svg");
	subgraph3NodeLinkSvg = d3.select("#subgraph3_node_link_svg");
	subgraph4NodeLinkSvg = d3.select("#subgraph4_node_link_svg");
	subgraph5NodeLinkSvg = d3.select("#subgraph5_node_link_svg");

	node_link_width = +templateNodeLinkSvg.style("width").replace("px", "");
	node_link_height = +templateNodeLinkSvg.style("height").replace("px", "");
	node_link_margin = { top: 20, bottom: 50, right: 20, left: 20 };
	node_link_innerWidth =
		node_link_width - node_link_margin.left - node_link_margin.right;
	node_link_innerHeight =
		node_link_height - node_link_margin.top - node_link_margin.bottom;

	updateEdgeData();
	drawNodeLinkChart(nodeLinkTemplateData, templateNodeLinkSvg, "Template");
	drawNodeLinkChart(nodeLinkSubgraph1Data, subgraph1NodeLinkSvg, "Subgraph1");
	drawNodeLinkChart(nodeLinkSubgraph2Data, subgraph2NodeLinkSvg, "Subgraph2");
	drawNodeLinkChart(nodeLinkSubgraph3Data, subgraph3NodeLinkSvg, "Subgraph3");
	drawNodeLinkChart(nodeLinkSubgraph4Data, subgraph4NodeLinkSvg, "Subgraph4");
	drawNodeLinkChart(nodeLinkSubgraph5Data, subgraph5NodeLinkSvg, "Subgraph5");
	drawLegend();
	drawLasso(subgraph1NodeLinkSvg, "Subgraph1");
	drawLasso(subgraph2NodeLinkSvg, "Subgraph2");
	drawLasso(subgraph3NodeLinkSvg, "Subgraph3");
	drawLasso(subgraph4NodeLinkSvg, "Subgraph4");
	drawLasso(subgraph5NodeLinkSvg, "Subgraph5");

	highlightSimilarCircles("Subgraph1");
	highlightSimilarCircles("Subgraph2");
	highlightSimilarCircles("Subgraph3");
	highlightSimilarCircles("Subgraph4");
	highlightSimilarCircles("Subgraph5");

	updateSimilarities();
}

function updateEdgeData() {
	nodeLinkTemplateData = [];
	for (let data of templateData) {
		if (checkedEdges.includes(data.eType)) {
			nodeLinkTemplateData.push(data);
		}
	}
	nodeLinkSubgraph1Data = [];
	for (let data of subgraph1Data) {
		if (checkedEdges.includes(data.eType)) {
			nodeLinkSubgraph1Data.push(data);
		}
	}
	nodeLinkSubgraph2Data = [];
	for (let data of subgraph2Data) {
		if (checkedEdges.includes(data.eType)) {
			nodeLinkSubgraph2Data.push(data);
		}
	}
	nodeLinkSubgraph3Data = [];
	for (let data of subgraph3Data) {
		if (checkedEdges.includes(data.eType)) {
			nodeLinkSubgraph3Data.push(data);
		}
	}
	nodeLinkSubgraph4Data = [];
	for (let data of subgraph4Data) {
		if (checkedEdges.includes(data.eType)) {
			nodeLinkSubgraph4Data.push(data);
		}
	}
	nodeLinkSubgraph5Data = [];
	for (let data of subgraph5Data) {
		if (checkedEdges.includes(data.eType)) {
			nodeLinkSubgraph5Data.push(data);
		}
	}
}

function updateSimilarities() {
	let averageSimilarities = {};
	let chartData = [];

	for (let subgraph in nodesUnderSimilarityPath) {
		if (subgraph != "Template") {
			if (subgraph === "Subgraph1") {
				chartData = nodeLinkSubgraph1Data;
			}
			if (subgraph === "Subgraph2") {
				chartData = nodeLinkSubgraph2Data;
			}
			if (subgraph === "Subgraph3") {
				chartData = nodeLinkSubgraph3Data;
			}
			if (subgraph === "Subgraph4") {
				chartData = nodeLinkSubgraph4Data;
			}
			if (subgraph === "Subgraph5") {
				chartData = nodeLinkSubgraph5Data;
			}

			let nodes = nodesUnderSimilarityPath[subgraph];
			let totalSimilarity = 0;
			let count = 0;

			nodes.forEach((nodeId) => {
				// Find the corresponding entry in chartData
				let entry = chartData.find((entry) => entry.Source === nodeId);
				if (entry) {
					if (entry.similarity != 0) {
						totalSimilarity += Number(entry.similarity);
						count++;
					}
					
				}
			});

			// Calculate the average similarity for the subgraph
			averageSimilarities[subgraph] = count > 0 ? totalSimilarity / count : 0;

			document.getElementById(
				`${subgraph}-current-similarity-percentage`
			).innerHTML =
				"current: " + averageSimilarities[subgraph].toFixed(2).toString() + "%";
		}
	}

	// console.log(averageSimilarities);
}

function drawLegend() {
	var nodeColors = ["#4E79A7", "#F28E2B", "#EDC948", "#E15759", "#59A14F"];
	var legendCategories = [
		"Person",
		"Procurement",
		"Document",
		"Financials",
		"Country",
	];
	var legendColorScale = d3
		.scaleOrdinal()
		.domain(legendCategories)
		.range(nodeColors);

	var legendContainer = d3.select("#color_legend");

	var legend = legendContainer.append("g").attr("class", "legend");

	var legendWidth = legendCategories.length * 150;

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
			return "translate(" + i * 150 + ", 0)"; // Adjust the spacing between legend items
		});

	legendItems
		.append("circle")
		.attr("cx", 9)
		.attr("cy", 9)
		.attr("r", 9)
		.style("fill", function (d) {
			return legendColorScale(d);
		});

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

function getNodes(chartData, chartTitle) {
	chartData.forEach(function (d) {
		d.source = +d["Source"];
		d.target = +d["Target"];
	});
	if (currentlySelectedSubgraphNodes[chartTitle].length != 0) {
		let tempChartData = [];
		for (i = 0; i < chartData.length; i++) {
			if (
				currentlySelectedSubgraphNodes[chartTitle].includes(
					chartTitle + "-" + chartData[i]["Source"]
				)
			) {
				tempChartData.push(chartData[i]);
			}
		}
		chartData = tempChartData;
	}

	nodeLinkNodes = [];
	nodeLinkNodes = chartData.map((d) => +d["Source"]);
	nodeLinkNodes = [...new Set(nodeLinkNodes)];

	//Ignore this variable name for now. It gets target ids basically
	var templateTargetIDs = chartData.map((d) => +d["Target"]);
	templateTargetIDs = [...new Set(templateTargetIDs)];
	templateTargetIDs.forEach((targetID) => {
		if (!nodeLinkNodes.includes(targetID)) {
			nodeLinkNodes.push(targetID);
		}
	});
	nodeLinkNodes.sort();
	node_list = [];
	nodeLinkNodes.forEach((d) => node_list.push({ id: d }));
	return [node_list, chartData];
}

function precalculatePositions(nodes, links) {
	const simulation = d3
		.forceSimulation(nodes)
		.force(
			"link",
			d3
				.forceLink(links)
				.id((d) => d.id)
				.strength(0.6)
		)
		.force("charge", d3.forceManyBody().strength(-50))
		.force(
			"center",
			d3.forceCenter(node_link_innerWidth / 2, node_link_innerHeight / 2)
		)
		.stop();

	// Run the simulation to completion
	for (let i = 0; i < 300; ++i) simulation.tick();

	// Store final positions in the nodes and links
	nodes.forEach((d) => {
		d.fixedX = d.x;
		d.fixedY = d.y;
	});
	links.forEach((d) => {
		d.fixedX1 = d.source.x;
		d.fixedY1 = d.source.y;
		d.fixedX2 = d.target.x;
		d.fixedY2 = d.target.y;
	});
}

function drawNodeLinkChart(chartData, chartSvg, chartTitle) {
	node_lists = getNodes(chartData, chartTitle);
	node_list = node_lists[0];
	chartData = node_lists[1];
	chartSvg.selectAll("g").remove();
	var NodeLinkG = chartSvg
		.append("g")
		.attr(
			"transform",
			`translate(${node_link_margin.left}, ${node_link_margin.top})`
		);

	if (chartData.length > 0) {
		precalculatePositions(node_list, chartData);

		//Tooltip
		nodeLinkTooltip = d3
			.select(".nodeLinkContainer")
			.append("div")
			.style("opacity", 0)
			.attr("class", "tooltip")
			.style("position", "absolute")
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "2px")
			.style("border-radius", "5px")
			.style("padding", "10px");

		var simulation = d3
			.forceSimulation(node_list)
			.force(
				"link",
				d3
					.forceLink(chartData)
					.id((d) => d.id)
					.strength(0.6)
			)
			.force("charge", d3.forceManyBody().strength(-50))
			.force(
				"center",
				d3.forceCenter(node_link_innerWidth / 2, node_link_innerHeight / 2)
			);

		// Draw links
		var links = NodeLinkG.selectAll(".link")
			.data(chartData)
			.join("line")
			.attr("class", "link")
			.style("stroke", "#E1E5EA");

		// const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
		var colorScale = d3
			.scaleOrdinal()
			.domain(["1", "2", "3", "4", "5"])
			.range(["#4E79A7", "#F28E2B", "#EDC948", "#E15759", "#59A14F"]);

		// Draw nodes
		var nodes = NodeLinkG.selectAll(".node")
			.data(node_list)
			.join("circle")
			.attr("id", (d) => chartTitle + "-" + d.id.toString())
			.attr("class", function (d) {
				if (chartTitle === "Template") {
					return "node";
				} else {
					if (
						nodeSimilarities["subgraph"][d.id] < similarityThreshold ||
						!(d.id in nodeSimilarities["subgraph"])
					) {
						return "node";
					} else {
						if (chartTitle === "Subgraph1") {
							return "node similar-1";
						}
						if (chartTitle === "Subgraph2") {
							return "node similar-2";
						}
						if (chartTitle === "Subgraph3") {
							return "node similar-3";
						}
						if (chartTitle === "Subgraph4") {
							return "node similar-4";
						}
						if (chartTitle === "Subgraph5") {
							return "node similar-5";
						} else {
							return "node";
						}
					}
				}
			})
			.attr("r", 5)
			.style("fill", function (d) {
				if (chartTitle === "Template") {
					return colorScale(templateNodeTypesMap.get(d.id.toString()));
				} else {
					if (
						nodeSimilarities["subgraph"][d.id] < similarityThreshold ||
						!(d.id in nodeSimilarities["subgraph"])
					) {
						return colorScale(nodeTypesMap.get(d.id.toString()));
					} else {
						return "black";
					}
				}
			})
			.on("mouseover", function (event, d) {
				if (chartTitle === "Template") {
					nodeLinkTooltip
						.html(
							"Node ID: " +
								d.id +
								"<br>" +
								"Node Type: " +
								templateNodeTypesMap.get(d.id.toString())
						)
						.style("opacity", 1)
						.style("width", "250px")
						.style("height", "100px")
						.style("left", event.pageX + 15 + "px")
						.style("top", event.pageY - 40 + "px");
				} else {
					if (!(d.id in similarNodes["subgraph"])) {
						var similarNodeInTemplate = "-";
						var similarityToTemplate = "0";
					} else {
						var similarNodeInTemplate =
							similarNodes["subgraph"][d.id].toString();
						var similarityToTemplate =
							nodeSimilarities["subgraph"][d.id].toString();

						document.getElementById(
							`Template-${similarNodeInTemplate}`
						).style.fill = "black";
					}

					nodeLinkTooltip
						.html(
							"Node ID: " +
								d.id +
								"<br>" +
								"Node Type: " +
								nodeTypesMap.get(d.id.toString()) +
								"<br>" +
								"Similarity: " +
								similarityToTemplate +
								"<br>" +
								"Similar Node: " +
								similarNodeInTemplate
						)
						.style("opacity", 1)
						.style("width", "250px")
						.style("height", "100px")

						.style("left", event.pageX + 15 + "px")
						.style("top", event.pageY - 40 + "px");
				}
			})
			.on("mousemove", function (event, d) {
				nodeLinkTooltip
					.style("top", event.pageY - 40 + "px")
					.style("left", event.pageX + 15 + "px");
			})
			.on("mouseleave", function (d, i) {
				nodeLinkTooltip
					.style("opacity", 0)
					.style("width", "0px")
					.style("height", "0px");
			});
		// .call(d3.drag()
		//     .on("start", dragstarted)
		//     .on("drag", dragged)
		//     .on("end", dragended));

		// Update simulation on each tick
		// simulation.on('tick', () => {
		//     links
		//         .attr('x1', d => d.source.x)
		//         .attr('y1', d => d.source.y)
		//         .attr('x2', d => d.target.x)
		//         .attr('y2', d => d.target.y);

		//     nodes
		//         .attr('cx', d => d.x)
		//         .attr('cy', d => d.y);
		// }
		// );
		links
			.attr("x1", (d) => d.fixedX1)
			.attr("y1", (d) => d.fixedY1)
			.attr("x2", (d) => d.fixedX2)
			.attr("y2", (d) => d.fixedY2);

		nodes.attr("cx", (d) => d.fixedX).attr("cy", (d) => d.fixedY);

		// simulation.on('end', () => {
		// highlightSimilarCircles(chartTitle);
		// });
	}

	NodeLinkG.append("text")
		.attr(
			"transform",
			`translate(${node_link_innerWidth / 2 - 50}, ${
				node_link_innerHeight + 25
			})`
		)
		.attr("x", 0)
		.attr("y", 0)
		.attr("dy", "0.7em")
		.text(chartTitle);

	// Define drag functions
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
}

// ===== Bound similar nodes using convex hull ===
// Helper function to get all points on the circle's perimeter
function getCirclePoints(circle, numPoints = 520) {
	const points = [];
	const cx = parseFloat(circle.getAttribute("cx"));
	const cy = parseFloat(circle.getAttribute("cy"));
	const r = parseFloat(circle.getAttribute("r"));
	for (let i = 0; i < numPoints; i++) {
		const angle = ((2 * Math.PI) / numPoints) * i;
		points.push({
			x: cx + r * Math.cos(angle),
			y: cy + r * Math.sin(angle),
		});
	}
	return points;
}

// Convex hull algorithm - Graham scan
function convexHull(points) {
	// Find the point with the lowest y-coordinate, break ties by x-coordinate
	points.sort((a, b) => a.y - b.y || a.x - b.x);
	const start = points[0];

	// Sort points by polar angle with the start point
	points.sort((a, b) => {
		const polarA = Math.atan2(a.y - start.y, a.x - start.x);
		const polarB = Math.atan2(b.y - start.y, b.x - start.x);
		return polarA - polarB;
	});

	const stack = [start, points[1], points[2]];
	for (let i = 3; i < points.length; i++) {
		let top = stack[stack.length - 1];
		let nextToTop = stack[stack.length - 2];
		let ccw =
			(top.x - nextToTop.x) * (points[i].y - nextToTop.y) -
			(top.y - nextToTop.y) * (points[i].x - nextToTop.x);
		while (ccw <= 0) {
			stack.pop();
			top = stack[stack.length - 1];
			nextToTop = stack[stack.length - 2];
			ccw =
				(top.x - nextToTop.x) * (points[i].y - nextToTop.y) -
				(top.y - nextToTop.y) * (points[i].x - nextToTop.x);
		}
		stack.push(points[i]);
	}
	return stack;
}

// Function to draw a smooth dotted line around the convex hull
function drawSmoothLine(points, svgId, chartTitle) {
	// Create the SVG path element
	const svgNS = "http://www.w3.org/2000/svg";
	const pathElement = document.createElementNS(svgNS, "path");
	let pathD = `M ${points[0].x},${points[0].y} `;

	for (let i = 1; i <= points.length; i++) {
		const start = points[i - 1];
		const end = points[i % points.length];
		const midPoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
		// Simple control points can be the midpoints for a smoother curve
		pathD += `Q ${start.x},${start.y} ${midPoint.x},${midPoint.y} `;
	}
	pathD += "Z"; // Close the path

	d3.selectAll(`.${chartTitle}-similar-nodes-path`).remove();
	pathElement.setAttribute("class", `${chartTitle}-similar-nodes-path`);
	pathElement.setAttribute("d", pathD);
	pathElement.setAttribute("stroke", "black");
	pathElement.setAttribute("stroke-dasharray", "5,5");
	pathElement.setAttribute("fill", "rgba(224, 213, 71, 0.5)");

	// Append the path to the SVG
	document.querySelector(svgId).appendChild(pathElement);

	d3.selectAll(`.${chartTitle}-similar-nodes-path`).call(dragPath);

	getElementsUnderPath(chartTitle);
}

// Main function to find the convex hull and draw the dotted line
function highlightSimilarCircles(chartTitle) {
	let className = "";
	let svgId = "";
	if (chartTitle === "Subgraph1") {
		className = "similar-1";
		svgId = "#subgraph1_node_link_svg";
	}
	if (chartTitle === "Subgraph2") {
		className = "similar-2";
		svgId = "#subgraph2_node_link_svg";
	}
	if (chartTitle === "Subgraph3") {
		className = "similar-3";
		svgId = "#subgraph3_node_link_svg";
	}
	if (chartTitle === "Subgraph4") {
		className = "similar-4";
		svgId = "#subgraph4_node_link_svg";
	}
	if (chartTitle === "Subgraph5") {
		className = "similar-5";
		svgId = "#subgraph5_node_link_svg";
	}
	const similarCircles = d3.selectAll(`.${className}`).nodes();
	let allPoints = [];

	// Collect points from all "similar" circles
	similarCircles.forEach((circle) => {
		const cx = +circle.getAttribute("cx");
		const cy = +circle.getAttribute("cy");
		const r = +circle.getAttribute("r");
		allPoints.push({ x: cx, y: cy, radius: r });
	});

	// Calculate the convex hull
	const hullPoints = convexHull(allPoints.map((p) => ({ x: p.x, y: p.y })));

	// Draw the smooth line around the hull
	drawSmoothLine(hullPoints, svgId, chartTitle);
}

function drawLasso(svg, chartTitle) {
	let lassoPath = [];
	let isDrawing = false;
	svg.selectAll(".lasso").remove();
	const lassoLine = svg.append("path").attr("class", "lasso");

	svg
		.on("mousedown", function (event) {
			currentlySelectedSubgraphNodes[chartTitle] = [];
			lassoPath = [d3.pointer(event)];
			isDrawing = true;
			lassoLine.attr("d", lineFunction(lassoPath));
		})
		.on("mousemove", function (event) {
			if (!isDrawing) return;
			lassoPath.push(d3.pointer(event));
			lassoLine.attr("d", lineFunction(lassoPath));
		})
		.on("mouseup", function () {
			isDrawing = false;
			lassoPath.push(lassoPath[0]); // Close the path
			lassoLine.attr("d", lineFunction(lassoPath));
			selectElements(lassoPath);
			nodeLinkMain();
		});

	// d3.select('#removeLassoBtn').on('click', function() {
	//     svg.selectAll('path.lassoFill').remove(); // Remove the lasso path from the SVG
	// });

	function lineFunction(points) {
		return d3.line().curve(d3.curveLinearClosed)(points); // Use curveLinearClosed to close the shape
	}

	function selectElements(lassoPolygon) {
		svg.selectAll(".node").each(function () {
			const element = d3.select(this);
			const cx = element.attr("cx");
			const cy = element.attr("cy");
			if (pointInPolygon([cx, cy], lassoPolygon)) {
				currentlySelectedSubgraphNodes[chartTitle].push(element.attr("id"));
			}
		});
	}

	function pointInPolygon(point, vs) {
		// Ray-casting algorithm based on
		// https://github.com/substack/point-in-polygon
		const x = point[0],
			y = point[1];

		let inside = false;
		for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
			const xi = vs[i][0],
				yi = vs[i][1];
			const xj = vs[j][0],
				yj = vs[j][1];

			const intersect =
				yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
			if (intersect) inside = !inside;
		}

		return inside;
	}
}

// Define the drag behavior
const dragPath = d3
	.drag()
	.on("start", function (event) {
		// You could store the starting position here if needed
	})
	.on("drag", function (event) {
		// This function is called during the drag event.

		// Calculate the delta (change) in x and y from the drag event
		const dx = event.dx;
		const dy = event.dy;

		// Select the current path element and update its position
		const path = d3.select(this);

		// Get the current 'd' attribute value, split into commands and parameters
		const dAttr = path.attr("d");
		const commands = dAttr.split(" ").map((cmd) => {
			// Split commands and coordinates
			const parts = cmd.split(",");
			if (parts.length === 2) {
				// If it's a coordinate pair, apply the delta
				const x = parseFloat(parts[0].replace(/[^\d.-]/g, "")) + dx;
				const y = parseFloat(parts[1]) + dy;
				return x + "," + y;
			}
			return cmd; // If it's not a coordinate pair, return it unchanged
		});

		// Join the commands back into a string and set it as the new 'd' attribute
		path.attr("d", commands.join(" "));
	})
	.on("end", function (event) {
		// Finalize any state if needed
		getElementsUnderPath(this.className.baseVal.split("-")[0]);
	});

function getElementsUnderPath(chartTitle) {
	const path = d3.select(`.${chartTitle}-similar-nodes-path`).node();

	// Get the SVG element using d3.js
	const svgNode = d3.select("#subgraph1_node_link_svg").node();

	// Select all circle elements with class 'node' using d3.js
	const circles = d3.selectAll(".node").nodes();

	nodesUnderSimilarityPath[chartTitle] = [];
	circles.forEach((circle) => {
		const cx = +circle.getAttribute("cx");
		const cy = +circle.getAttribute("cy");
		const r = +circle.getAttribute("r"); // Radius of the circle

		// Check multiple points around the circle's perimeter

		for (let angle = 0; angle < 360; angle += 5) {
			// Angle step can be adjusted for precision
			let point = svgNode.createSVGPoint();
			point.x = cx + r * Math.cos((angle * Math.PI) / 180);
			point.y = cy + r * Math.sin((angle * Math.PI) / 180);

			if (path.isPointInStroke(point) || path.isPointInFill(point)) {
				if (circle.id.includes(chartTitle)) {
					nodesUnderSimilarityPath[chartTitle].push(circle.id.split("-")[1]);
				}

				break; // Break the loop if any point of the circle is under the path
			}
		}
	});
	updateSimilarities();
}
