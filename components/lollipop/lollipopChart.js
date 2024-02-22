let templateLollipopChartSvg,
	subgraphLollipopChartSvg,
	templateLollipopG,
	subgraphLollipopG,
	lollipopChartWidth,
	lollipopChartHeight,
	lollipopChartInnerHeight,
	lollipopChartInnerWidth,
	lollipopChartMargin,
	lollipopChartTooltip,
	lollipopSubgraph1,
	lollipopSubgraph2,
	lollipopSubgraph3,
	lollipopSubgraph4,
	lollipopSubgraph5,
	lollipopTemplateSubgraph,
	subgraph,
	subgraphLabel,
	lollipopTemplateXScale,
	lollipopTemplateYScale,
	lollipopSubgraphXScale,
	lollipopSubgraphYScale;

function lollipopChartMain() {
	if (checkedEdges.includes('0') || checkedEdges.includes('1')) {
		document.getElementById("LollipopChart").style.display = "block";
		templateLollipopChartSvg = d3.select("#template_lollipop_svg");
		subgraphLollipopChartSvg = d3.select("#subgraph_lollipop_svg");
		lollipopChartWidth = +templateLollipopChartSvg
			.style("width")
			.replace("px", "");
		lollipopChartHeight = +templateLollipopChartSvg
			.style("height")
			.replace("px", "");
		lollipopChartMargin = { top: 20, bottom: 50, right: 20, left: 60 };
		lollipopChartInnerWidth =
			lollipopChartWidth - lollipopChartMargin.left - lollipopChartMargin.right;
		lollipopChartInnerHeight =
			lollipopChartHeight -
			lollipopChartMargin.top -
			lollipopChartMargin.bottom;

		cleanLollipopData();
		drawLollipopLegend();
		drawLollipopChart();
		drawSubgraphLollipopChart();
	} else {
		document.getElementById("LollipopChart").style.display = "none";
	}
}

function drawLollipopChart() {
	templateLollipopChartSvg.selectAll("g").remove();
	//Tooltip
	lollipopChartTooltip = d3
		.select(".lollipopChartContainer")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("position", "absolute")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "2px")
		.style("border-radius", "5px")
		.style("padding", "10px");

	templateLollipopG = templateLollipopChartSvg
		.append("g")
		.attr(
			"transform",
			`translate(${lollipopChartMargin.left}, ${lollipopChartMargin.top})`
		);
	//Template Axis
	lollipopTemplateXScale = d3
		.scaleTime()
		.domain(
			d3.extent(lollipopTemplateSubgraph, (d) => convertTimeToDate(d["Time"]))
		)
		.range([0, lollipopChartInnerWidth]);

	var xAxis = templateLollipopG
		.append("g")
		.attr("class", "xaxis")
		.attr("transform", `translate(0,${lollipopChartInnerHeight})`)
		.call(
			d3.axisBottom(lollipopTemplateXScale).tickFormat(d3.timeFormat("%m-%d"))
		)
		.selectAll("text")
		.style("text-anchor", "middle");
	// .attr("transform", "rotate(-30)");

	var templateSourceIDs = lollipopTemplateSubgraph.map((d) => +d["Source"]);
	templateSourceIDs.sort();
	templateSourceIDs = [...new Set(templateSourceIDs)];

	lollipopTemplateYScale = d3
		.scaleBand()
		.domain(templateSourceIDs)
		.range([lollipopChartInnerHeight, 0]);
	// .padding(0.1);

	templateLollipopG
		.append("g")
		.call(d3.axisLeft(lollipopTemplateYScale))
		.attr("class", "yaxis");

	var brush = d3
		.brushX() // Add the brush feature using the d3.brush function
		.extent([
			[0, 0],
			[lollipopChartInnerWidth, lollipopChartInnerHeight],
		]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
		.on("end", function (event) {
			extent = event.selection;
			// console.log(extent);
			// If no selection, back to initial coordinate. Otherwise, update X axis domain
			if (!extent) {
				if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
				lollipopTemplateXScale.domain(
					d3.extent(lollipopTemplateSubgraph, (d) =>
						convertTimeToDate(d["Time"])
					)
				);
				lollipopSubgraphXScale.domain(
					d3.extent(
						subgraph.lollicurrentSimilarNodes,
						(d) => convertTimeToDate(d["Time"])
					)
				);
			} else {
				lollipopTemplateXScale.domain([
					lollipopTemplateXScale.invert(extent[0]),
					lollipopTemplateXScale.invert(extent[1]),
				]);
				lollipopSubgraphXScale.domain([
					lollipopSubgraphXScale.invert(extent[0]),
					lollipopSubgraphXScale.invert(extent[1]),
				]);
				scatter.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
			}

			// Update axis and circle position
			templateLollipopG
				.selectAll(".xaxis")
				.transition()
				.attr("transform", `translate(0,${lollipopChartInnerHeight})`)
				.duration(1000)
				.call(
					d3
						.axisBottom(lollipopTemplateXScale)
						.tickFormat(d3.timeFormat("%Y-%m-%d"))
				);
			scatter
				.selectAll(".lines")
				.transition()
				.duration(1000)
				.attr("x1", function (d) {
					return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
				})
				.attr("x2", function (d) {
					return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
				})
				.attr("y1", function (d) {
					return lollipopTemplateYScale(+d["Source"]);
				})
				.attr("y2", function (d) {
					return lollipopTemplateYScale(+d["Target"]);
				})
				.attr("stroke", "grey")
				.attr("stroke-width", "1px");
			scatter
				.selectAll(".fromCircles")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					return lollipopTemplateYScale(+d["Source"]);
				})
				.attr("r", 5)
				.attr("fill", "#69b3a2");
			scatter
				.selectAll(".toCircles")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					return lollipopTemplateYScale(+d["Target"]);
				})
				.attr("r", 5)
				.attr("fill", "#4C4082");
			subgraphLollipopG
				.selectAll(".xaxis")
				.transition()
				.attr("transform", `translate(0,${lollipopChartInnerHeight})`)
				.duration(1000)
				.call(
					d3
						.axisBottom(lollipopSubgraphXScale)
						.tickFormat(d3.timeFormat("%Y-%m-%d"))
				);
			subgraphLollipopG
				.selectAll(".lines")
				.transition()
				.duration(1000)
				.attr("x1", function (d) {
					return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
				})
				.attr("x2", function (d) {
					return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
				})
				.attr("y1", function (d) {
					return lollipopSubgraphYScale(+d["Source"]);
				})
				.attr("y2", function (d) {
					return lollipopSubgraphYScale(+d["Target"]);
				})
				.attr("stroke", "grey")
				.attr("stroke-width", "1px");
			subgraphLollipopG
				.selectAll(".fromCircles")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					return lollipopSubgraphYScale(+d["Source"]);
				})
				.attr("r", 5)
				.attr("fill", "#69b3a2");
			subgraphLollipopG
				.selectAll(".toCircles")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					return lollipopSubgraphYScale(+d["Target"]);
				})
				.attr("r", 5)
				.attr("fill", "#4C4082");
		});

	var scatter = templateLollipopG.append("g").attr("clip-path", "url(#clip)");

	scatter.append("g").attr("class", "brush").call(brush);

	var idleTimeout;
	function idled() {
		idleTimeout = null;
	}

	lines = scatter.selectAll(".lines").data(lollipopTemplateSubgraph);

	lines
		.join((enter) =>
			enter.append("line").call((enter) =>
				enter
					.transition()
					.duration(100)
					.attr("x1", function (d) {
						return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
					})
					.attr("x2", function (d) {
						return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
					})
					.attr("y1", function (d) {
						return lollipopTemplateYScale(+d["Source"]);
					})
					.attr("y2", function (d) {
						return lollipopTemplateYScale(+d["Target"]);
					})
					.attr("stroke", "grey")
					.attr("stroke-width", "1px")
			)
		)
		.attr("class", "lines");

	fromCircles = scatter
		.selectAll(".fromCircles")
		.data(lollipopTemplateSubgraph);

	fromCircles
		.join((enter) =>
			enter.append("circle").call((enter) =>
				enter
					.transition()
					.duration(100)
					.attr("cx", function (d) {
						return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
					})
					.attr("cy", function (d) {
						return lollipopTemplateYScale(+d["Source"]);
					})
					.attr("r", 5)
					.attr("fill", "#69b3a2")
			)
		)
		.attr("class", "fromCircles")
		.on("mouseover", function (event, d) {
			lollipopChartTooltip
				.html(
					"Source: " +
						d["Source"] +
						"<br>" +
						"Receiver: " +
						d["Target"] +
						"<br>" +
						"Time: " +
						convertTimeToDate(d["Time"]).toDateString() +
						"<br>"
				)
				.style("opacity", 1)
				.style("left", event.pageX + 15 + "px")
				.style("top", event.pageY - 40 + "px");
		})
		.on("mousemove", function (event, d) {
			lollipopChartTooltip
				.style("top", event.pageY - 40 + "px")
				.style("left", event.pageX + 15 + "px");
		})
		.on("mouseleave", function (d, i) {
			lollipopChartTooltip.style("opacity", 0);
		});

	toCircles = scatter.selectAll(".toCircles").data(lollipopTemplateSubgraph);

	toCircles
		.join((enter) =>
			enter.append("circle").call((enter) =>
				enter
					.transition()
					.duration(100)
					.attr("cx", function (d) {
						return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
					})
					.attr("cy", function (d) {
						return lollipopTemplateYScale(+d["Target"]);
					})
					.attr("r", 5)
					.attr("fill", "#4C4082")
			)
		)
		.attr("class", "toCircles")
		.on("mouseover", function (event, d) {
			lollipopChartTooltip
				.html(
					"Source: " +
						d["Source"] +
						"<br>" +
						"Receiver: " +
						d["Target"] +
						"<br>" +
						"Time: " +
						convertTimeToDate(d["Time"]).toDateString() +
						"<br>"
				)
				.style("opacity", 1)
				.style("left", event.pageX + 15 + "px")
				.style("top", event.pageY - 40 + "px");
		})
		.on("mousemove", function (event, d) {
			lollipopChartTooltip
				.style("top", event.pageY - 40 + "px")
				.style("left", event.pageX + 15 + "px");
		})
		.on("mouseleave", function (d, i) {
			lollipopChartTooltip.style("opacity", 0);
		});

	scatter
		.append("text")
		.attr(
			"transform",
			`translate(${lollipopChartInnerWidth / 2 - 90}, ${
				lollipopChartInnerHeight + 15
			})`
		)
		.attr("x", 30)
		.attr("y", 20)
		.attr("dy", "0.7em")
		.text("Time: Template");

	scatter
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -lollipopChartInnerHeight / 2 - 15)
		.attr("y", -49)
		.attr("text-anchor", "middle")
		.text("Source ID");
}

function drawSubgraphLollipopChart() {
	//Tooltip
	lollipopChartTooltip = d3
		.select(".lollipopChartContainer")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("position", "absolute")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "2px")
		.style("border-radius", "5px")
		.style("padding", "10px");

	subgraphLollipopChartSvg.selectAll("g").remove();
	data = subgraph.lollicurrentSimilarNodes;
	// console.log(data);
	subgraphLollipopG = subgraphLollipopChartSvg
		.append("g")
		.attr(
			"transform",
			`translate(${lollipopChartMargin.left}, ${lollipopChartMargin.top})`
		);
	//Template Axis
	lollipopSubgraphXScale = d3
		.scaleTime()
		.domain(
			d3.extent(lollipopTemplateSubgraph, (d) => convertTimeToDate(d["Time"]))
		)
		.range([0, lollipopChartInnerWidth]);

	var xAxis = subgraphLollipopG
		.append("g")
		.attr("class", "xaxis")
		.attr("transform", `translate(0,${lollipopChartInnerHeight})`)
		.transition()
		.duration(100)
		.call(
			d3.axisBottom(lollipopSubgraphXScale).tickFormat(d3.timeFormat("%m-%d"))
		)
		.selectAll("text")
		.style("text-anchor", "middle");
	// .attr("transform", "rotate(-30)");

	var subgraphSourceIDs = data.map((d) => +d["Source"]);
	subgraphSourceIDs.sort();
	subgraphSourceIDs = [...new Set(subgraphSourceIDs)];

	lollipopSubgraphYScale = d3
		.scaleBand()
		.domain(subgraphSourceIDs)
		.range([lollipopChartInnerHeight, 0]);
	// .padding(0.1);

	subgraphLollipopG
		.append("g")
		.attr("class", "yaxis")
		.transition()
		.duration(100)
		.call(d3.axisLeft(lollipopSubgraphYScale));

	var brush = d3
		.brushX() // Add the brush feature using the d3.brush function
		.extent([
			[0, 0],
			[lollipopChartInnerWidth, lollipopChartInnerHeight],
		]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
		.on("end", function (event) {
			extent = event.selection;
			// console.log(extent);
			// If no selection, back to initial coordinate. Otherwise, update X axis domain
			if (!extent) {
				if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
				lollipopTemplateXScale.domain(
					d3.extent(lollipopTemplateSubgraph, (d) =>
						convertTimeToDate(d["Time"])
					)
				);
				lollipopSubgraphXScale.domain(
					d3.extent(
						document.getElementById("similarSeedSelect").value,
						(d) => convertTimeToDate(d["Time"])
					)
				);
			} else {
				lollipopTemplateXScale.domain([
					lollipopTemplateXScale.invert(extent[0]),
					lollipopTemplateXScale.invert(extent[1]),
				]);
				lollipopSubgraphXScale.domain([
					lollipopSubgraphXScale.invert(extent[0]),
					lollipopSubgraphXScale.invert(extent[1]),
				]);
				scatter.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
			}

			// Update axis and circle position
			templateLollipopG
				.selectAll(".xaxis")
				.transition()
				.attr("transform", `translate(0,${lollipopChartInnerHeight})`)
				.duration(1000)
				.call(
					d3
						.axisBottom(lollipopTemplateXScale)
						.tickFormat(d3.timeFormat("%Y-%m-%d"))
				);
			templateLollipopG
				.selectAll(".lines")
				.transition()
				.duration(1000)
				.attr("x1", function (d) {
					return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
				})
				.attr("x2", function (d) {
					return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
				})
				.attr("y1", function (d) {
					return lollipopTemplateYScale(+d["Source"]);
				})
				.attr("y2", function (d) {
					return lollipopTemplateYScale(+d["Target"]);
				})
				.attr("stroke", "grey")
				.attr("stroke-width", "1px");
			templateLollipopG
				.selectAll(".fromCircles")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					return lollipopTemplateYScale(+d["Source"]);
				})
				.attr("r", 5)
				.attr("fill", "#69b3a2");
			templateLollipopG
				.selectAll(".toCircles")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return lollipopTemplateXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					return lollipopTemplateYScale(+d["Target"]);
				})
				.attr("r", 5)
				.attr("fill", "#4C4082");
			subgraphLollipopG
				.selectAll(".xaxis")
				.transition()
				.attr("transform", `translate(0,${lollipopChartInnerHeight})`)
				.duration(1000)
				.call(
					d3
						.axisBottom(lollipopSubgraphXScale)
						.tickFormat(d3.timeFormat("%Y-%m-%d"))
				);
			scatter
				.selectAll(".lines")
				.transition()
				.duration(1000)
				.attr("x1", function (d) {
					return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
				})
				.attr("x2", function (d) {
					return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
				})
				.attr("y1", function (d) {
					return lollipopSubgraphYScale(+d["Source"]);
				})
				.attr("y2", function (d) {
					return lollipopSubgraphYScale(+d["Target"]);
				})
				.attr("stroke", "grey")
				.attr("stroke-width", "1px");
			scatter
				.selectAll(".fromCircles")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					return lollipopSubgraphYScale(+d["Source"]);
				})
				.attr("r", 5)
				.attr("fill", "#69b3a2");
			scatter
				.selectAll(".toCircles")
				.transition()
				.duration(1000)
				.attr("cx", function (d) {
					return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
				})
				.attr("cy", function (d) {
					return lollipopSubgraphYScale(+d["Target"]);
				})
				.attr("r", 5)
				.attr("fill", "#4C4082");
		});

	var scatter = subgraphLollipopG.append("g").attr("clip-path", "url(#clip)");

	scatter.append("g").attr("class", "brush").call(brush);

	var idleTimeout;
	function idled() {
		idleTimeout = null;
	}

	lines = scatter.selectAll(".lines").data(data);

	lines
		.join((enter) =>
			enter.append("line").call((enter) =>
				enter
					// .transition()
					// .duration(100)
					.attr("x1", function (d) {
						return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
					})
					.attr("x2", function (d) {
						return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
					})
					.attr("y1", function (d) {
						return lollipopSubgraphYScale(+d["Source"]);
					})
					.attr("y2", function (d) {
						return lollipopSubgraphYScale(+d["Target"]);
					})
					.attr("stroke", "grey")
					.attr("stroke-width", "1px")
			)
		)
		.attr("class", "lines");

	fromCircles = scatter.selectAll(".fromCircles").data(data);

	fromCircles
		.join((enter) =>
			enter.append("circle").call((enter) =>
				enter
					.attr("cx", function (d) {
						return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
					})
					.attr("cy", function (d) {
						return lollipopSubgraphYScale(+d["Source"]);
					})
					.attr("r", 5)
					.attr("fill", "#69b3a2")
			)
		)
		.attr("class", "fromCircles")
		.on("mouseover", function (event, d) {
			lollipopChartTooltip
				.html(
					"Source: " +
						d["Source"] +
						"<br>" +
						"Receiver: " +
						d["Target"] +
						"<br>" +
						"Time: " +
						convertTimeToDate(d["Time"]).toDateString() +
						"<br>"
				)
				.style("opacity", 1)
				.style("left", event.pageX + 15 + "px")
				.style("top", event.pageY - 40 + "px");
		})
		.on("mousemove", function (event, d) {
			lollipopChartTooltip
				.style("top", event.pageY - 40 + "px")
				.style("left", event.pageX + 15 + "px");
		})
		.on("mouseleave", function (d, i) {
			lollipopChartTooltip.style("opacity", 0);
		});

	toCircles = scatter.selectAll(".toCircles").data(data);

	toCircles
		.join((enter) =>
			enter.append("circle").call((enter) =>
				enter
					.attr("cx", function (d) {
						return lollipopSubgraphXScale(convertTimeToDate(d["Time"]));
					})
					.attr("cy", function (d) {
						return lollipopSubgraphYScale(+d["Target"]);
					})
					.attr("r", 5)
					.attr("fill", "#4C4082")
			)
		)
		.attr("class", "toCircles")
		.on("mouseover", function (event, d) {
			lollipopChartTooltip
				.html(
					"Source: " +
						d["Source"] +
						"<br>" +
						"Receiver: " +
						d["Target"] +
						"<br>" +
						"Time: " +
						convertTimeToDate(d["Time"]).toDateString() +
						"<br>"
				)
				.style("opacity", 1)
				.style("left", event.pageX + 15 + "px")
				.style("top", event.pageY - 40 + "px");
		})
		.on("mousemove", function (event, d) {
			lollipopChartTooltip
				.style("top", event.pageY - 40 + "px")
				.style("left", event.pageX + 15 + "px");
		})
		.on("mouseleave", function (d, i) {
			lollipopChartTooltip.style("opacity", 0);
		});

	scatter
		.append("text")
		.attr(
			"transform",
			`translate(${lollipopChartInnerWidth / 2 - 90}, ${
				lollipopChartInnerHeight + 15
			})`
		)
		.attr("x", -10)
		.attr("y", 20)
		.attr("dy", "0.7em")
		.text(
			"Time: " + document.getElementById("similarSeedSelect").value
		);

	scatter
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -lollipopChartInnerHeight / 2 - 15)
		.attr("y", -49)
		.attr("text-anchor", "middle")
		.text("Source ID");
}

function cleanLollipopData() {
	lollipopSubgraph1 = [];
	for (let data of subgraph1Data) {
		if (checkEdge(data.eType)) {
			lollipopSubgraph1.push(data);
		}
	}
	lollipopSubgraph2 = [];
	for (let data of subgraph2Data) {
		if (checkEdge(data.eType)) {
			lollipopSubgraph2.push(data);
		}
	}
	lollipopSubgraph3 = [];
	for (let data of subgraph3Data) {
		if (checkEdge(data.eType)) {
			lollipopSubgraph3.push(data);
		}
	}
	lollipopSubgraph4 = [];
	for (let data of subgraph4Data) {
		if (checkEdge(data.eType)) {
			lollipopSubgraph4.push(data);
		}
	}
	lollipopSubgraph5 = [];
	for (let data of subgraph5Data) {
		if (checkEdge(data.eType)) {
			lollipopSubgraph5.push(data);
		}
	}
	lollipopTemplateSubgraph = [];
	for (let data of templateData) {
		if (checkEdge(data.eType)) {
			lollipopTemplateSubgraph.push(data);
		}
	}
	lollicurrentSimilarNodes = [];
	for (let data of currentSimilarNodes) {
		if (checkEdge(data.eType)) {
			lollicurrentSimilarNodes.push(data);
		}
	}

	
	subgraph = {
		subGraph1Data: lollipopSubgraph1,
		subGraph2Data: lollipopSubgraph2,
		subGraph3Data: lollipopSubgraph3,
		subGraph4Data: lollipopSubgraph4,
		subGraph5Data: lollipopSubgraph5,
		lollicurrentSimilarNodes: lollicurrentSimilarNodes,
	};
	subgraphLabel = {
		subGraph1Data: "Subgraph1",
		subGraph2Data: "Subgraph2",
		subGraph3Data: "Subgraph3",
		subGraph4Data: "Subgraph4",
		subGraph5Data: "Subgraph5",
	};
}

function checkEdge(edge) {
	if (checkedEdges.includes(edge) && (edge == "0" || edge == "1")) {
		// console.log(edge);
		return true;
	}
	return false;
}

function drawLollipopLegend() {
	var nodeColors = ["#69b3a2", "#4C4082"];
	var legendCategories = ["From", "To"];
	var legendColorScale = d3
		.scaleOrdinal()
		.domain(legendCategories)
		.range(nodeColors);

	var legendContainer = d3.select("#lollipop_color_legend");

	var legend = legendContainer.append("g").attr("class", "legend");

	var legendWidth = legendCategories.length * 120;
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
			return "translate(" + i * 120 + ", 0)"; // Adjust the spacing between legend items
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
