let templateBarSvg, subGraphBarSvg, width, height, innerHeight, innerWidth, margin, offset, templateBarG, subGraphBarG, yScale, yAxis, xAxis, xScale, barLabel;
let subGraph1EdgeCount = {};

function barChartMain() {
    templateBarSvg = d3.select("#template_bar_svg");
    subGraphBarSvg = d3.select("#subgraph_bar_svg");

    width = +templateBarSvg.style('width').replace('px','');
    height = +templateBarSvg.style('height').replace('px','');
    margin = { top:20, bottom: 50, right: 20, left: 60 };
    innerWidth = width - margin.left - margin.right;
    innerHeight = height - margin.top - margin.bottom; 
    offset = 5;

    drawBarChart();
}

    function drawBarChart(){
        subGraphBarSvg.selectAll('g').remove();
        subGraphBarG = subGraphBarSvg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
        templateBarG = templateBarSvg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

        //Tooltip
        var tooltip = d3.select(".barContainer")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position","absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "10px");

        //Template Axis
        yScale = d3.scaleLinear()
                .domain([0, d3.max(Object.values(templateEdgeCount))])
                .range([ innerHeight, 0]);
        yAxis = templateBarG.append('g').attr("class","y-axis");

        xScale = d3.scaleBand()
                .domain(Object.keys(templateEdgeCount))
                .range([0,innerWidth])
                .padding(0.2);
        xAxis = templateBarG.append('g').attr("class","x-axis");
        let selectedSubgraph = document.getElementById("subgraphSelect").value;

        let selectedSubgraphData = [];
        if (selectedSubgraph === "subGraph1Data") {
            selectedSubgraphData = subgraph1Data;
            barLabel = "Subgraph 1";
        } else if (selectedSubgraph == 'subGraph2Data') {
            selectedSubgraphData = subgraph2Data;
            barLabel = "Subgraph 2";
        } else if (selectedSubgraph == 'subGraph3Data') {
            selectedSubgraphData = subgraph3Data;
            barLabel = "Subgraph 3";
        } else if (selectedSubgraph == 'subGraph4Data') {
            selectedSubgraphData = subgraph4Data;
            barLabel = "Subgraph 4";
        } else if (selectedSubgraph == 'subGraph5Data') {
            selectedSubgraphData = subgraph5Data;
            barLabel = "Subgraph 5";
        }

        subGraph1EdgeCount[0] = (selectedSubgraphData.filter(element => element["eType"] == 0)).length;
        subGraph1EdgeCount[1] = (selectedSubgraphData.filter(element => element["eType"] == 1)).length;
        subGraph1EdgeCount[2] = (selectedSubgraphData.filter(element => element["eType"] == 2)).length;
        subGraph1EdgeCount[3] = (selectedSubgraphData.filter(element => element["eType"] == 3)).length;
        subGraph1EdgeCount[4] = (selectedSubgraphData.filter(element => element["eType"] == 4)).length;
        subGraph1EdgeCount[5] = (selectedSubgraphData.filter(element => element["eType"] == 5)).length;
        subGraph1EdgeCount[6] = (selectedSubgraphData.filter(element => element["eType"] == 6)).length;

        //SubGraph Axis
        subGraph_yScale = d3.scaleLinear()
         .domain([0, d3.max(Object.values(subGraph1EdgeCount))])
         .range([ innerHeight, 0]);
        subGraph_yAxis = subGraphBarG.append('g').attr("class","y-axis");

        templateBarG.selectAll("rect")
            .data(Object.entries(templateEdgeCount))
            .enter()
            .append("rect")
            .attr("x", d => xScale(d[0]))
            .attr("y", d => yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .attr("height", d => innerHeight - yScale(d[1]))
            .attr("fill", "#7071E8")
            .attr("stroke", "#7071E8")
            .attr("stroke-width", 1)
            .on("mouseover", function(event,d){                
                tooltip
                    .html("Count: " + d[1] + "<br>" + "eType: " + d[0])
                    .style("opacity", 1)
                    .style("left", (event.pageX) + 15 + "px")
                    .style("top", (event.pageY) - 40 + "px");
            })
            .on("mousemove", function(event,d){
                tooltip
                    .style('top', event.pageY - 40 + 'px')
                    .style('left', event.pageX + 15 + 'px');
            })
            .on("mouseleave", function(d,i){
                tooltip.style("opacity", 0);
            });

        // X-Axis
        templateBarG.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "middle");

        // Y-axis
        templateBarG.append("g")
            .call(d3.axisLeft(yScale));
        
        //Subgraph Bar Chart
        subGraphBarG.selectAll("rect")
            .data(Object.entries(subGraph1EdgeCount))
            .enter()
            .append("rect")
            .attr("x", d => xScale(d[0]))
            .attr("y", d => subGraph_yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .attr("height", d => innerHeight - subGraph_yScale(d[1]))
            .attr("fill", "#7071E8")
            .attr("stroke", "#7071E8")
            .attr("stroke-width", 1)
            .on("mouseover", function(event,d){                
                tooltip
                    .html("Count: " + d[1] + "<br>" + "eType: " + d[0])
                    .style("opacity", 1)
                    .style("left", (event.pageX) + 15 + "px")
                    .style("top", (event.pageY) - 40 + "px");
            })
            .on("mousemove", function(event,d){
                tooltip
                    .style('top', event.pageY - 40 + 'px')
                    .style('left', event.pageX + 15 + 'px');
            })
            .on("mouseleave", function(d,i){
                tooltip.style("opacity", 0);
            });


        // X-Axis
        subGraphBarG.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "middle");

        // Y-axis
        subGraphBarG.append("g")
            .call(d3.axisLeft(subGraph_yScale));

        //Axis-labels
        subGraphBarG.append("text")
        .attr("transform",`translate(${innerWidth/2 - 90}, ${innerHeight + 15})`)
        .attr("x", 30)
        .attr("y", 10)
        .attr("dy", "0.7em")
        .text("eType: " + barLabel);

        subGraphBarG.append('text')
        .attr('transform','rotate(-90)')
        .attr('x',-innerHeight/2 - 15)
        .attr('y',-37)
        .attr('text-anchor','middle')
        .text('Count of eType')

        templateBarG.append("text")
        .attr("transform",`translate(${innerWidth/2 - 50}, ${innerHeight + 15})`)
        .attr("x", -10)
        .attr("y", 10)
        .attr("dy", "0.7em")
        .text("eType: Template");

        templateBarG.append('text')
        .attr('transform','rotate(-90)')
        .attr('x',-innerHeight/2 - 15)
        .attr('y',-37)
        .attr('text-anchor','middle')
        .text('Count of eType')
    }
