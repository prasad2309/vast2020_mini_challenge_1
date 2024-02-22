# Project Title

Vast Challenge 2020 - Mini-Challenge 1: Graph Analysis

## Description

The objective of this challenge is to leverage visual analytics to determine a significant dataset provided by the Center for Global Cyber Strategy (CGCS), which comprises anonymized profiles created from data donated by white hat groups. These profiles encapsulate the behavioral and structural characteristics of various groups, one of which has been hypothesized by CGCS sociopsychologists to closely resemble the organization inadvertently responsible for a major internet outage. Our task within this challenge is to engage in a meticulous comparative analysis of the CGCS's provided subgraph template—a representation of the suspect group's structure—against several candidate subgraphs. The aim is to determine which of these subgraphs exhibits the highest degree of congruence with the template, thus identifying the group that most likely matches the profile associated with the outage.

### Getting Started

- Clone the project into your local machine using `git clone <project_url>`
- Install the "live server" plugin for Visual Studio code
- Click on "Go Live" button to spin up a server on port 5500
- Another to run the project way would be using Python http server `python3 -m http.server`
- Use `localhost:<port>` to access the project

### Dependencies

- [D3.js](https://d3js.org/) - Graph visualizations 
- [Bootstrap](https://getbootstrap.com/) - Styling and layout
- [virtual-select.js](https://sa-si-dev.github.io/virtual-select/#/) - Dynamic dropdowns


## Components
1. `arc-diagram` - Used to identify potential seed nodes structures that match the template.
2. `bar-graph` - Used to identify which subgraph eType activity correlates the most with the template.
3. `heat-map` - Used to identify which potential seed graph spend activity correlates the most with the template.
4. `lollipop` - Used to identify which potential seed graph communication activity correlates the most with the template.
5. `multiline` - Used to identify which subgraph activity correlates the most with the template with time.
6. `node-link` - Holistic identifier for the matching of template with the subgraphs, shows the subregion with the most similarity to template.
7. `scatter-activities-plot` - Used to find out the activity history of each of the nodes using a scatter plot.
8. `scatter-travel-history` - Used to find out the travel history of each of the nodes using scatter plot and flag glyphs.

### Challenges
- Memory and Computation overhead: Loading the dataset which was 6GB in size was quite challenging which is why we had to preprocess a lot before hand. Having access to a larger dataset would be 
- In depth analysis: While cosine similarity was a great metric for us to work with and provided near-accurate results, working with it gives us a lack of contextual knowledge of the dataset we are working with
- Seed similarity analysis: While working with subgraphs was easier, working with subgraphs and template as the number of records was just about 2000-3000 records whereas the seed graph consists of 2000 child nodes per node, which means evaluating about 5 million node links in our main graph, while those links would’ve been useful we couldn’t evaluate them.

## Contribute
1. Create new components in the `components` dir, with it's own js and css files
2. Use index.js and style.css for global js and css 
3. data can be found in the `data` dir
4. `assest` dir will hold images, fonts etc..

## Authors
1. Darshan Vipresh - dsheth10@asu.edu
2. Deep Rodge - drodge@asu.edu
3. Jayati Goyal - jgoyal2@asu.edu
4. Prasad Mahalpure - pmahalpu@asu.edu
5. Kaushal Yadav - kryadav@asu.edu
6. Sravya Thummeti - sthummet@asu.edu
