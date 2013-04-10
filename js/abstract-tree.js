/******************************************************************
Compilers, Project 2
Author: Max Lapides

Script: Abstract Syntax Tree

******************************************************************/

// Declare globals for JSHint:
/*global buildD3ParseTree:true*/

function AbstractTree() {

	this.root = null;
	this.cur = null;

	// Add a node: kind = [branch|leaf]
	this.addNode = function(token, kind) {

		// Construct the node object
		var node = new Node(token, this.cur);

		// if there are no nodes in the tree yet, start the tree here
		if(!this.cur) {
			this.cur = node;

		// otherwise, add this node to the children array
		} else {
			this.cur.addChild(node);
		}

		// if we are an interior/branch node, then update the current node to be this node
		if (kind === "branch") {
			this.cur = node;
		}

		// if this node is the super root, set it as the root of the tree
		if(token === "Super Root") {
			this.root = node;
		}

		outVerbose(parseTabs() + "Added node -> " + node.toString());

	};

	this.startBranch = function(branchName) {
		this.addNode(branchName, "branch");

		if((typeof branchName === "object") && !isNaN(branchName.type)) {
			if(branchName.value) {
				branchName = getTokenType(branchName.type) + " " + branchName.value;
			} else {
				branchName = getTokenType(branchName.type);
			}
		}

		outVerbose(parseTabs() + "Creating " + branchName + " branch");
		numTabs++;
	};

	this.endBranch = function() {

		// if the current node has a parent (i.e. is NOT the superRoot)
		if(this.cur.parent) {

			// move the current node up to this node's parent
			this.cur = this.cur.parent;

		// otherwise, we have a problem
		} else {
			outError("ERROR: can't end branch because parent does not exist.");
		}

		numTabs--;

	};

	this.traverseTree = function(treeRoot) {

		// if token type is a number
		if(!isNaN(treeRoot.token.type)) {
			this.addNode(treeRoot.token, "leaf");
			return;
		}

		switch(treeRoot.token) {

			case "Statement":

				// print statement
				if(treeRoot.children[0].token.type === T_TYPE.PRINT) {
					this.startBranch("print");
					this.traverseTree(treeRoot.children[2]);
					this.endBranch();
				}

				// assignment statement
				else if(treeRoot.children[1] && treeRoot.children[1].token.type === T_TYPE.EQUAL) {
					this.startBranch("assign");
					this.addNode(treeRoot.children[0].token, "leaf");
					this.traverseTree(treeRoot.children[2]);
					this.endBranch();
				}

				// block
				else if(treeRoot.children[0] && treeRoot.children[0].token.type === T_TYPE.BRACE) {
					this.startBranch("block");
					this.traverseTree(treeRoot.children[1]);
					this.endBranch();
				}

				// otherwise (VarDecl)
				else if(treeRoot.children[0]) {
					this.traverseTree(treeRoot.children[0]);
				}

				break;

			case "StatementList":
				if(treeRoot.children[0]) {
					this.traverseTree(treeRoot.children[0]);
				}
				if(treeRoot.children[1]) {
					this.traverseTree(treeRoot.children[1]);
				}
				break;

			case "IntExpr":
				if(treeRoot.children[1]) {
					this.startBranch(treeRoot.children[1].token); // use operation as branch root
					this.traverseTree(treeRoot.children[0]);
					this.traverseTree(treeRoot.children[2]);
					this.endBranch();
				} else {
					this.traverseTree(treeRoot.children[0]);
				}
				break;

			case "StringExpr":
				this.startBranch("string");
				this.traverseTree(treeRoot.children[1]);
				this.endBranch();
				break;

			case "CharList":
				this.traverseTree(treeRoot.children[0]);
				if(treeRoot.children[1]) {
					this.traverseTree(treeRoot.children[1]);
				}
				break;

			case "VarDecl":
				this.startBranch("declare");
				this.addNode(treeRoot.children[0].token, "leaf");
				this.addNode(treeRoot.children[1].token, "leaf");
				this.endBranch();
				break;

			default:
				if(treeRoot.children[0]) {
					this.traverseTree(treeRoot.children[0]);
				}
				break;

		}

	};

	this.addNode("Super Root", "branch");
	this.traverseTree(parseTree.root);

}

function buildAbstractTree() {

	out("<br />BUILDING ABSTRACT SYNTAX TREE...");

	stage = "abstractTree";

	// reset the index, numTabs, nodeId
	index = 0;
	numTabs = 1;
	nodeId = 0;

	// create the parse tree
	var t = new AbstractTree();
	//t.treeProgram();

	if(errorCount > 0) {

		// plural or singular error?
		var error = "error";
		if(errorCount > 1) {
			error += "s";
		}

		out(tab + errorCount + " " + error + " found. Halting compiling.");

	} else {

		buildD3ParseTree(t, "#abstract-tree");
		out(tab + '<a class="fancybox" href="#abstract-tree">Click here to see visual abstract syntax tree</a>');
		out(tab + "Abstract syntax tree build successful!");

	}

	return t;

}