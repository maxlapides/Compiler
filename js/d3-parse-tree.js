/******************************************************************
Compilers, Project 3
Author: Max Lapides

Script: D3 Parse Tree

Creates a visual parse tree using the D3.js library
More information about D3.js: http://d3js.org

******************************************************************/

// Declare globals for JSHint:
/*global d3:true, self:true*/

function buildD3ParseTree(t, selector) {

	this.tree = t;
	this.data = {};
	this.leafCounter = 0;

	// used to convert Tree object into array of arrays
	this.addBranch = function(treeBranch) {

		var branch = {};
		branch.title = "[" + treeBranch.id + "] " + treeBranch.tokenToString();

		// if this branch has children
		if(treeBranch.children.length !== 0) {

			branch.children = [];

			// create a new branch for each child
			for(var i = 0; i < treeBranch.children.length; i++) {
				branch.children.push(this.addBranch(treeBranch.children[i]));
			}

		// otherwise, this is a leaf node
		} else {
			this.leafCounter++;
		}

		return branch;

	};

	// convert tree, skipping Super Root
	this.data = this.addBranch(this.tree.root.children[0]);

	function update() {
		svg.attr("transform"," scale(" + d3.event.scale + ")");
	}

	// set the width of graph dynamically
	var width;

	// if there are more than 8 leaves, set the width to be based on the total number of leaves
	if(this.leafCounter > 8) {
		width = this.leafCounter * 110;

	// otherwise, stick with 900px
	} else {
		width = 870;
	}

	var height = 700;

	var cluster = d3.layout.cluster()
		.size([width, height - 50]);

	var diagonal = d3.svg.diagonal()
		.projection(function (d) { return [d.x, d.y]; });

	var svg = d3.select(selector).append("svg")
		.attr("width", width)
		.attr("height", height)
		//.call(d3.behavior.zoom().on("zoom", update))
		.append("g")
		.attr("transform", "translate(40,0)");

	var nodes = cluster.nodes(this.data),
		links = cluster.links(nodes);

	var link = svg.selectAll(".link")
		.data(links)
		.enter().append("path")
		.attr("class", "link")
		.attr("d", diagonal);

	var node = svg.selectAll(".node")
		.data(nodes)
		.enter().append("g")
		.attr("class", "node")
		.attr("transform", function (d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

	node.append("circle")
		.attr("r", 10);

	node.append("text")
		.attr("dx", function (d) {
			return d.children ? 15 : -(d.title.length*5)/2;
		})
		.attr("dy", function (d) {
			return d.children ? 4 : 25;
		})
		.text(function (d) {
			return d.title;
		});

	d3.select(self.frameElement).style("height", height + "px");

}