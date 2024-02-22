let templateData,
	subgraph1Data,
	subgraph2Data,
	subgraph3Data,
	subgraph4Data,
	subgraph5Data,
	nodeTypes,
	nodeTypesMap,
	templateNodeTypes,
	templateNodeTypesMap,
	demographicCategories,
	demographicCategoriesMap,
	checkedEdges;
let templateEdgeCount = {};
let nodeSimilarities = {}
let similarNodes = {}
let seedDataPruned, seedDataPruned1, seedDataPruned2, seedDataPruned3;
let currentSimilarNodes;



function setSimilarities(type, key, data) {
    if (!(type in nodeSimilarities)) { 
        nodeSimilarities[type] = {}
        similarNodes[type] = {}
    }
    for (i = 0; i < data.length; i++){
        if (!(Number(data[i][key]) in nodeSimilarities[type])) {
            nodeSimilarities[type][Number(data[i][key])] = Number(data[i]["similarity"])
            similarNodes[type][Number(data[i][key])] = Number(data[i]["similar_template_node"])
        }
    }
}

function similarNodesDropdown(dropdown) {
	if (dropdown.value === "Similar Seed Nodes 1") {
		currentSimilarNodes = seedDataSimilarNodesPruned1;
	}
	if (dropdown.value === "Similar Seed Nodes 2") {
		currentSimilarNodes = seedDataSimilarNodesPruned2;
	}
	if (dropdown.value === "Similar Seed Nodes 3") {
		currentSimilarNodes = seedDataSimilarNodesPruned3;
	}
	drawHeatMap();
	travelScatterPlotMain();
	lollipopChartMain();
}

document.addEventListener("DOMContentLoaded", function () {
	Promise.all([
		d3.csv("data/Q1-Graph1.csv"),
		d3.csv("data/Q1-Graph2.csv"),
		d3.csv("data/Q1-Graph3.csv"),
		d3.csv("data/Q1-Graph4.csv"),
		d3.csv("data/Q1-Graph5.csv"),
		d3.csv("data/CGCS-Template.csv"),
		d3.csv("data/CGCS-GraphData-NodeTypes.csv"),
		d3.csv("data/CGCS-Template-NodeTypes.csv"),
        d3.csv("data/DemographicCategories.csv"),
        d3.csv('data/seed_pruned_1.csv'),
        d3.csv('data/seed_pruned_2.csv'),
		d3.csv('data/seed_pruned_3.csv'),
		d3.csv('data/similarity/seed1_filtered.csv'),
		d3.csv('data/similarity/seed2_filtered.csv'),
		d3.csv('data/similarity/seed3_filtered.csv'),
	]).then(function (values) {
		// Entry point
		// Do data wrangling here
		subgraph1Data = values[0];
		subgraph2Data = values[1];
		subgraph3Data = values[2];
		subgraph4Data = values[3];
		subgraph5Data = values[4];
		templateData = values[5];
		nodeTypes = values[6];
		templateNodeTypes = values[7];
        demographicCategories = values[8];
        seedDataPruned1 = values[9];
        seedDataPruned2 = values[10];
		seedDataPruned3 = values[11];
		seedDataSimilarNodesPruned1 = values[12];
		seedDataSimilarNodesPruned2 = values[13];
		seedDataSimilarNodesPruned3 = values[14];

		currentSimilarNodes = seedDataSimilarNodesPruned1;

        setSimilarities("subgraph", "Source", subgraph1Data)
        setSimilarities("subgraph", "Source", subgraph2Data)
        setSimilarities("subgraph", "Source", subgraph3Data)
        setSimilarities("subgraph", "Source", subgraph4Data)
        setSimilarities("subgraph", "Source", subgraph5Data)

        setSimilarities("seed", "Target", seedDataPruned1)
        setSimilarities("seed", "Target", seedDataPruned2)
        setSimilarities("seed", "Target", seedDataPruned3)
		
        nodeTypesMap = new Map();
		templateNodeTypesMap = new Map();
		demographicCategoriesMap = new Map();

		for (const key in nodeTypes) {
			if (key === "columns") continue;
			const v = nodeTypes[key];
			nodeTypesMap.set(v["NodeID"], v["NodeType"]);
		}

		for (const key in templateNodeTypes) {
			if (key === "columns") continue;
			const v = templateNodeTypes[key];
			templateNodeTypesMap.set(v["NodeID"], v["NodeType"]);
		}

		for (const key in demographicCategories) {
			if (key === "columns") continue;
			const v = demographicCategories[key];
			demographicCategoriesMap.set(v["NodeID"], v["Category"]);
		}

		templateEdgeCount[0] = templateData.filter(
			(element) => element["eType"] == 0
		).length;
		templateEdgeCount[1] = templateData.filter(
			(element) => element["eType"] == 1
		).length;
		templateEdgeCount[2] = templateData.filter(
			(element) => element["eType"] == 2
		).length;
		templateEdgeCount[3] = templateData.filter(
			(element) => element["eType"] == 3
		).length;
		templateEdgeCount[4] = templateData.filter(
			(element) => element["eType"] == 4
		).length;
		templateEdgeCount[5] = templateData.filter(
			(element) => element["eType"] == 5
		).length;
		templateEdgeCount[6] = templateData.filter(
			(element) => element["eType"] == 6
		).length;
		activitiesScatterPlotMain();
		barChartMain();
		seedChartMain();
		heatMapMain();
		lollipopChartMain();
		arcDiagramMain();
		travelScatterPlotMain();
		multilinePlotMain();
		nodeLinkMain();
	});

	// multi-select edges dropdown
	VirtualSelect.init({
		ele: "#selectEdgeType",
		silentInitialValueSet: false,
	});
	document.querySelector("#selectEdgeType").toggleSelectAll(true);

	document
		.querySelector("#selectEdgeType")
		.addEventListener("change", function () {
			// console.log(this.value);
			checkedEdges = this.value;
			multilinePlotMain();
			lollipopChartMain();
			nodeLinkMain();
		});
});

function onSelectedSubgraphChange(event) {
	drawBarChart();
	drawSubgraphScatterActivitiesChart();
	multilinePlotMain();
}
