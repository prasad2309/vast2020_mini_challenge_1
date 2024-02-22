let templateScatterActivitiesSvg,
	subgraphScatterActivitiesSvg,
	templateScatterG,
	subgraphScatterG,
	scatter_activities_width,
	scatter_activities_height,
	scatter_activities_innerHeight,
	scatter_activities_innerWidth,
	scatter_activities_margin,
	scatterActivitiesLabel,
	scatterTooltip,
	templateXScale,
	templateYScale,
	subgraphXScale,
	subgraphYScale;

function drawScatterLegend() {
	console.log("Drawing legend");
	var nodeColors = ["#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#4e79a7", "#af7aa1", "#edc949"];

	var legendCategories = [
		"Edge 0: Email",
		"Edge 1: Phone",
		"Edge 2: Sell",
		"Edge 3: Buy",
		"Edge 4: Author",
		"Edge 5: Financial",
		"Edge 6: Travel"
	];
	var legendColorScale = d3
		.scaleOrdinal()
		.domain(legendCategories)
		.range(nodeColors);

	var legendContainer = d3.select("#scatter_color_legend");

	var legend = legendContainer.append("g").attr("class", "legend");

	var legendWidth = legendCategories.length * 160;

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
			return "translate(" + i * 160 + ", 0)"; // Adjust the spacing between legend items
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

function activitiesScatterPlotMain() {
	templateScatterActivitiesSvg = d3.select("#template_scatter_svg");
	subgraphScatterActivitiesSvg = d3.select("#subgraph_scatter_svg");
	scatter_activities_width = +templateScatterActivitiesSvg
		.style("width")
		.replace("px", "");
	scatter_activities_height = +templateScatterActivitiesSvg
		.style("height")
		.replace("px", "");
	scatter_activities_margin = { top: 20, bottom: 50, right: 20, left: 60 };
	scatter_activities_innerWidth =
		scatter_activities_width -
		scatter_activities_margin.left -
		scatter_activities_margin.right;
	scatter_activities_innerHeight =
		scatter_activities_height -
		scatter_activities_margin.top -
		scatter_activities_margin.bottom;

	drawScatterActivitiesChart();
	drawSubgraphScatterActivitiesChart();
	drawScatterLegend();
}

function drawScatterActivitiesChart() {
	//Tooltip
	scatterTooltip = d3
		.select(".scatterActivitiesContainer")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("position", "absolute")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "2px")
		.style("border-radius", "5px")
		.style("padding", "10px");

	templateScatterG = templateScatterActivitiesSvg
		.append("g")
		.attr(
			"transform",
			`translate(${scatter_activities_margin.left}, ${scatter_activities_margin.top})`
		);

	//Template Axis
	templateXScale = d3
		.scaleTime()
		.domain(d3.extent(templateData, (d) => convertTimeToDate(d["Time"])))
		.range([0, scatter_activities_innerWidth]);

	var xAxis = templateScatterG
		.append("g")
		.attr("class", "xaxis")
		.attr("transform", `translate(0,${scatter_activities_innerHeight})`)
		.call(d3.axisBottom(templateXScale).tickFormat(d3.timeFormat("%Y-%m-%d")))
		.selectAll("text")
		.style("text-anchor", "middle")
		.attr("transform", "rotate(-20)");

	var templateSourceIDs = templateData.map((d) => +d["Source"]);
	templateSourceIDs = [...new Set(templateSourceIDs)];
	
	templateYScale = d3
		.scaleBand()
		.domain(templateSourceIDs)
		.range([scatter_activities_innerHeight, 0]);

	templateScatterG
		.append("g")
		.call(d3.axisLeft(templateYScale))
		.attr("class", "yaxis");

	// brushing
	var brush = d3
		.brushX() 
		.extent([
			[0, 0],
			[scatter_activities_innerWidth, scatter_activities_innerHeight],
		])
		.on("end", function (event) {
			extent = event.selection;
			// console.log(extent);
			// If no selection, back to initial coordinate. Otherwise, update X axis domain
			if (!extent) {
				if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
				templateXScale.domain(
					d3.extent(templateData, (d) => convertTimeToDate(d["Time"]))
				);
				subgraphXScale.domain(
					d3.extent(templateData, (d) => convertTimeToDate(d["Time"]))
				);
			} else {
				templateXScale.domain([
					templateXScale.invert(extent[0]),
					templateXScale.invert(extent[1]),
				]);
				subgraphXScale.domain([
					subgraphXScale.invert(extent[0]),
					subgraphXScale.invert(extent[1]),
				]);
				scatter.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
			}

			// Update axis and circle position
			templateScatterG
				.selectAll(".xaxis")
				.transition()
				.attr("transform", `translate(0,${scatter_activities_innerHeight})`)
				.duration(1000)
				.call(
					d3.axisBottom(templateXScale).tickFormat(d3.timeFormat("%Y-%m-%d"))
				);
			scatter
				.selectAll("circle")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return templateXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					return templateYScale(+d["Source"]);
				});
			subgraphScatterG
				.selectAll(".xaxis")
				.transition()
				.attr("transform", `translate(0,${scatter_activities_innerHeight})`)
				.duration(1000)
				.call(
					d3.axisBottom(subgraphXScale).tickFormat(d3.timeFormat("%Y-%m-%d"))
				);
			subgraphScatterG
				.selectAll("circle")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return subgraphXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					// console.log(+d["Source"]);
					return subgraphYScale(+d["Source"]);
				});
		});

	var scatter = templateScatterG.append("g").attr("clip-path", "url(#clip)");

	scatter.append("g").attr("class", "brush").call(brush);

	var idleTimeout;
	function idled() {
		idleTimeout = null;
	}

	//Color scale for eType
	const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

	//Template Scatter Plot
	scatter
		.selectAll("circle")
		.data(templateData)
		.enter()
		.append("circle")
		.attr("cx", (d) => templateXScale(convertTimeToDate(d["Time"])))
		.attr("cy", (d) => templateYScale(+d["Source"]))
		.attr("r", 5)
		.attr("fill", (d) => colorScale(d.eType))
		.on("mouseover", function (event, d) {
			scatterTooltip
				.html(
					"eType: " +
						d["eType"] +
						"<br>" +
						"Source: " +
						d["Source"] +
						"<br>" +
						"Target: " +
						d["Target"] +
						"<br>" +
						"Time: " +
						convertTimeToDate(d["Time"]).toDateString() +
						"<br>" +
						"Weight: " +
						d["Weight"]
				)
				.style("opacity", 1)
				.style("left", event.pageX + 15 + "px")
				.style("top", event.pageY - 40 + "px");
		})
		.on("mousemove", function (event, d) {
			scatterTooltip
				.style("top", event.pageY - 40 + "px")
				.style("left", event.pageX + 15 + "px");
		})
		.on("mouseleave", function (d, i) {
			scatterTooltip.style("opacity", 0);
		});

	//Axis-labels
	scatter
		.append("text")
		.attr(
			"transform",
			`translate(${scatter_activities_innerWidth / 2 - 90}, ${
				scatter_activities_innerHeight + 15
			})`
		)
		.attr("x", 30)
		.attr("y", 20)
		.attr("dy", "0.7em")
		.text("Time: Template");

	scatter
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -scatter_activities_innerHeight / 2 - 15)
		.attr("y", -49)
		.attr("text-anchor", "middle")
		.text("Source ID");
}

function drawSubgraphScatterActivitiesChart() {
	subgraphScatterActivitiesSvg.selectAll("g").remove();
	subgraphScatterG = subgraphScatterActivitiesSvg
		.append("g")
		.attr(
			"transform",
			`translate(${scatter_activities_margin.left}, ${scatter_activities_margin.top})`
		);

	let selectedScatterSubgraph = document.getElementById("subgraphSelect").value;

	let selectedScatterSubgraphData = [];
	if (selectedScatterSubgraph === "subGraph1Data") {
		selectedScatterSubgraphData = subgraph1Data;
		scatterActivitiesLabel = "Subgraph 1";
	} else if (selectedScatterSubgraph == "subGraph2Data") {
		selectedScatterSubgraphData = subgraph2Data;
		scatterActivitiesLabel = "Subgraph 2";
	} else if (selectedScatterSubgraph == "subGraph3Data") {
		selectedScatterSubgraphData = subgraph3Data;
		scatterActivitiesLabel = "Subgraph 3";
	} else if (selectedScatterSubgraph == "subGraph4Data") {
		selectedScatterSubgraphData = subgraph4Data;
		scatterActivitiesLabel = "Subgraph 4";
	} else if (selectedScatterSubgraph == "subGraph5Data") {
		selectedScatterSubgraphData = subgraph5Data;
		scatterActivitiesLabel = "Subgraph 5";
	}

	//SubGraph Axis
	subgraphXScale = d3
		.scaleTime()
		.domain(d3.extent(templateData, (d) => convertTimeToDate(d["Time"])))
		.range([0, scatter_activities_innerWidth]);

	var xAxis = subgraphScatterG
		.append("g")
		.attr("class", "xaxis")
		.attr("transform", `translate(0,${scatter_activities_innerHeight})`)
		.call(d3.axisBottom(subgraphXScale).tickFormat(d3.timeFormat("%Y-%m-%d")))
		.selectAll("text")
		.style("text-anchor", "middle")
		.attr("transform", "rotate(-20)");

	//Getting unique source IDs
	var subgraphSourceIDs = selectedScatterSubgraphData.map((d) => +d["Source"]);
	subgraphSourceIDs = [...new Set(subgraphSourceIDs)];

	subgraphYScale = d3
		.scaleBand()
		.domain(subgraphSourceIDs)
		.range([scatter_activities_innerHeight, 0]);

	subgraphScatterG
		.append("g")
		.call(d3.axisLeft(subgraphYScale))
		.attr("class", "yaxis");

	// brushing
	var brush = d3
		.brushX() // Add the brush feature using the d3.brush function
		.extent([
			[0, 0],
			[scatter_activities_innerWidth, scatter_activities_innerHeight],
		]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
		.on("end", function (event) {
			extent = event.selection;
			// console.log(extent);
			// If no selection, back to initial coordinate. Otherwise, update X axis domain
			if (!extent) {
				if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
				subgraphXScale.domain(
					d3.extent(templateData, (d) => convertTimeToDate(d["Time"]))
				);
				templateXScale.domain(
					d3.extent(templateData, (d) => convertTimeToDate(d["Time"]))
				);
			} else {
				subgraphXScale.domain([
					subgraphXScale.invert(extent[0]),
					subgraphXScale.invert(extent[1]),
				]);
				templateXScale.domain([
					templateXScale.invert(extent[0]),
					templateXScale.invert(extent[1]),
				]);
				scatter.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
			}
			templateScatterG
				.selectAll(".xaxis")
				.transition()
				.attr("transform", `translate(0,${scatter_activities_innerHeight})`)
				.duration(1000)
				.call(
					d3.axisBottom(templateXScale).tickFormat(d3.timeFormat("%Y-%m-%d"))
				);
			templateScatterG
				.selectAll("circle")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return templateXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					return templateYScale(+d["Source"]);
				});
			// Update axis and circle position
			subgraphScatterG
				.selectAll(".xaxis")
				.transition()
				.attr("transform", `translate(0,${scatter_activities_innerHeight})`)
				.duration(1000)
				.call(
					d3.axisBottom(subgraphXScale).tickFormat(d3.timeFormat("%Y-%m-%d"))
				);
			scatter
				.selectAll("circle")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return subgraphXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					return subgraphYScale(+d["Source"]);
				});
		});

	var scatter = subgraphScatterG.append("g").attr("clip-path", "url(#clip)");

	scatter.append("g").attr("class", "brush").call(brush);

	var idleTimeout;
	function idled() {
		idleTimeout = null;
	}

	//Color scale for eType
	const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

	//Template Scatter Plot
	scatter
		.selectAll("circle")
		.data(selectedScatterSubgraphData)
		.enter()
		.append("circle")
		.attr("cx", (d) => subgraphXScale(convertTimeToDate(d["Time"])))
		.attr("cy", (d) => subgraphYScale(+d["Source"]))
		.attr("r", 5)
		.attr("fill", (d) => colorScale(d.eType))
		.on("mouseover", function (event, d) {
			scatterTooltip
				.html(
					"eType: " +
						d["eType"] +
						"<br>" +
						"Source: " +
						d["Source"] +
						"<br>" +
						"Target: " +
						d["Target"] +
						"<br>" +
						"Time: " +
						convertTimeToDate(d["Time"]).toDateString() +
						"<br>" +
						"Weight: " +
						d["Weight"]
				)
				.style("opacity", 1)
				.style("left", event.pageX + 15 + "px")
				.style("top", event.pageY - 40 + "px");
		})
		.on("mousemove", function (event, d) {
			scatterTooltip
				.style("top", event.pageY - 40 + "px")
				.style("left", event.pageX + 15 + "px");
		})
		.on("mouseleave", function (d, i) {
			scatterTooltip.style("opacity", 0);
		});

	//Axis-labels
	scatter
		.append("text")
		.attr(
			"transform",
			`translate(${scatter_activities_innerWidth / 2 - 90}, ${
				scatter_activities_innerHeight + 15
			})`
		)
		.attr("x", 30)
		.attr("y", 20)
		.attr("dy", "0.7em")
		.text("Time: " + scatterActivitiesLabel);

	scatter
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -scatter_activities_innerHeight / 2 - 15)
		.attr("y", -49)
		.attr("text-anchor", "middle")
		.text("Source ID");
}

function convertTimeToDate(timeInSeconds) {
	const january1st2025 = new Date("2025-01-01T00:00:00Z");
	const eventTime = new Date(january1st2025.getTime() + timeInSeconds * 1000);

	// Format the date as a string
	const dateString = eventTime.toISOString().split("T")[0]; // Extract YYYY-MM-DD

	return new Date(dateString);
}
