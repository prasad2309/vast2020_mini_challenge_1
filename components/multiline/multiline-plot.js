let multilineSvg,
    multilineSvg_width,
    multilineSvg_height,
    multilineSvg_margin,
    multilineSvg_innerWidth,
    multilineSvg_innerHeight,
    MultilineLabel;

function drawMultilineLegend() {
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

    var legendContainer = d3.select("#multiline_color_legend");

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

function multilinePlotMain() {
    drawMultilineChart((svgName = "#template_multiline_svg"));
    drawMultilineChart((svgName = "#subgraph_multiline_svg"));
    drawMultilineLegend();
    //drawSubgraphMultilineChart();
}

function drawMultilineChart(svgName) {
    multilineSvg = d3.select(svgName);
    multilineSvg_width = +multilineSvg.style("width").replace("px", "");
    multilineSvg_height = +multilineSvg.style("height").replace("px", "");
    multilineSvg_margin = { top: 20, bottom: 50, right: 20, left: 60 };
    multilineSvg_innerWidth =
        multilineSvg_width - multilineSvg_margin.left - multilineSvg_margin.right;
    multilineSvg_innerHeight =
        multilineSvg_height - multilineSvg_margin.top - multilineSvg_margin.bottom;

    var subgraphs = {
        subGraph1Data: subgraph1Data,
        subGraph2Data: subgraph2Data,
        subGraph3Data: subgraph3Data,
        subGraph4Data: subgraph4Data,
        subGraph5Data: subgraph5Data,
    };

    var eTypes = {
        0: "Email",
        1: "Phone",
        2: "Sell",
        3: "Buy",
        4: "Author",
        5: "Financial",
        6: "Travel",
    };

    multilineChartTooltip = d3
        .select(".multilineContainer")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    const startDate = new Date("2023-01-01T00:00:00Z"); // Set start date to 1st Jan 2023

    function addSecondsToDate(startDate, seconds) {
        return new Date(startDate.getTime() + seconds * 1000);
    }

    function getMonthYearString(date) {
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    const countsByMonth = {};

    multilineSvg.selectAll("g").remove();
    data =
        svgName == "#subgraph_multiline_svg"
            ? subgraphs[document.getElementById("subgraphSelect").value]
            : templateData;

    const checkedCheckboxes = checkedEdges;

    data.forEach(record => {
        const date = addSecondsToDate(startDate, record.Time);
        const monthYear = getMonthYearString(date);
        if (record.Time > 0) { // Initialize if not present && eType != 5
            if (!countsByMonth[monthYear]) {
                countsByMonth[monthYear] = {};
                for (eachEType of checkedCheckboxes) {
                    countsByMonth[monthYear][eachEType] = 0
                }
            }
        }
    });

    data.forEach(record => {
        const date = addSecondsToDate(startDate, record.Time);
        const monthYear = getMonthYearString(date);
        const eType = record.eType;


        if (record.Time > 0 && checkedCheckboxes.includes(eType)) { // Initialize if not present && eType != 5
            countsByMonth[monthYear][eType]++;
        }
    });

    const resultArray = [];

    Object.keys(countsByMonth).forEach((monthYear) => {
        Object.keys(countsByMonth[monthYear]).forEach((eType) => {
            const count = +countsByMonth[monthYear][eType];
            resultArray.push({
                time: monthYear,
                etype: parseInt(eType, 10), // Ensure eType is a number
                count: count,
            });
        });
    });

    const svgg = multilineSvg
        .append("g")
        .attr(
            "transform",
            "translate(" +
            multilineSvg_margin.left +
            "," +
            multilineSvg_margin.top +
            ")"
        );

    const parseTime = d3.timeParse("%m/%Y");
    resultArray.forEach((d) => {
        d.date = parseTime(d.time);
    });

    // Nest the data by eType
    const dataNest = d3.group(resultArray, (d) => d.etype);

    // Add X axis --> it is a date format
    var x = d3
        .scaleTime()
        .domain(d3.extent(resultArray, (d) => new Date(d.date)))
        .range([0, multilineSvg_innerWidth]);

    // Add Y axis
    var y = d3
        .scalePow()
        .exponent(0.15)
        .domain([0, d3.max(resultArray, (d) => +d.count)])
        .range([multilineSvg_innerHeight, 0]);

    var color = d3
        .scaleOrdinal()
        .domain([0, 1, 2, 3, 4, 5, 6])
        .range(["#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#4e79a7", "#af7aa1", "#edc949"]);

    const lineGroup = svgg
        .selectAll(".line-group")
        .data(dataNest)
        .enter()
        .append("g")
        .attr("class", "line-group");

    const line = d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(+d.count))
        // .curve(d3.curveCatmullRom.alpha(0.8));

    lineGroup
        .append("path")
        .datum((d) => {
            return d[1];
        })
        // .transition()
        // .duration(1000)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke-width", 2.5)
        .attr("stroke", (d) => {
            return color(d[1].etype);
        })
        .attr("d", line);

    circles = lineGroup.selectAll("circle").data((d) => d[1]);
    circles
        .join((enter) =>
            enter.append("circle").call((enter) =>
                enter
                    // .transition()
                    // .duration(1000)
                    .attr("cx", (d) => x(d.date))
                    .attr("cy", (d) => y(d.count))
                    .attr("stroke", (d) => color(d.etype))
                    .attr("r", 4)
                    .attr("stroke-width", 2.5)
                    .attr("fill", "white")
            )
        )
        .attr("class", "circles")
        .on("mouseover", function (event, d) {
            multilineChartTooltip
                .html(
                    "eType: " +
                    eTypes[d.etype] +
                    "<br>" +
                    "Count: " +
                    d.count +
                    "<br>" +
                    "Time: " +
                    d.date.toLocaleDateString("en-us", {
                        year: "numeric",
                        month: "short",
                    }) +
                    "<br>"
                )
                .style("opacity", 1)
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY - 40 + "px");
        })
        .on("mousemove", function (event, d) {
            multilineChartTooltip
                .style("top", event.pageY - 40 + "px")
                .style("left", event.pageX + 15 + "px");
        })
        .on("mouseleave", function (d, i) {
            multilineChartTooltip.style("opacity", 0);
        });



    svgg.append("g")
        .call(d3.axisLeft(y));

    svgg.append("g")
        .attr("transform", "translate(0," + multilineSvg_innerHeight + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b-%y")).ticks(12));

    svgg
        .append("text")
        .attr(
            "transform",
            `translate(${multilineSvg_innerWidth / 4}, ${multilineSvg_innerHeight + 15
            })`
        )
        .attr("x", 30)
        .attr("y", 20)
        .attr("dy", "0.7em")
        .text("Time: " + (svgName == "#template_multiline_svg" ? "TemplateGraph" : document.getElementById("subgraphSelect").value));
    // console.log(svgName, svgName == "#template_multiline_svg" ? "TemplateGraph" : document.getElementById("subgraphSelect").value)
    svgg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -multilineSvg_innerHeight / 2 - 15)
        .attr("y", -49)
        .attr("text-anchor", "middle")
        .text("Count of activity in each month");
}
