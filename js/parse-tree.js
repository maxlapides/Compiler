/******************************************************************
Compilers, Project 2
Author: Max Lapides

Script: Parse Tree

******************************************************************/

// Declare globals for JSHint:
/*global buildD3ParseTree:true*/

function Node(token, parent, children) {

	this.id = nodeId++;
	this.token = token;
	this.parent = parent;

	// if no children parameter given, initialize with an empty array
	if(children === undefined || children === null) {
		this.children = [];
	} else {
		this.children = children;
	}

	this.addChild = function(childNode) {
		this.children.push(childNode);
	};

	this.tokenToString = function() {

		if(!isNaN(this.token.type)) {

			if(this.token.value !== undefined && this.token.value !== null) {
				return getTokenType(this.token.type) + " " + this.token.value;
			} else {
				return getTokenType(this.token.type);
			}

		} else {
			return this.token;
		}
	};

	this.toString = function() {
		if(this.parent === null) {
			return "[" + this.id + "] " + this.tokenToString();
		} else {
			return "[" + this.id + "] " + this.tokenToString() + ", Parent: node " + this.parent.id;
		}
	};

}

function Tree() {

	this.root = null;
	this.cur = null;

	// Add a node: kind = [branch|leaf]
	this.addNode = function(token, kind) {

		// Construct the node object
		var node = new Node(token, this.cur);

		// if there are no nodes in the tree yet, start the tree here
		if(this.cur === null) {
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
		outVerbose(parseTabs() + "Creating " + branchName + " branch");
		numTabs++;
	};

	this.endBranch = function() {

		// if the current node has a parent (i.e. is NOT the superRoot)
		if(this.cur.parent !== null && this.cur.parent !== undefined) {

			// move the current node up to this node's parent
			this.cur = this.cur.parent;

		// otherwise, we have a problem
		} else {
			outError("ERROR: can't end branch because parent does not exist.");
		}

		numTabs--;

	};

	// checks token, moves pointer to next token
	this.checkToken = function(tokenType, tokenValue) {

		// check to make sure given token type matches current token type
		if(T_TYPE[tokenType] !== currToken().type) {
			outError("ERROR: expected " + tokenType + ", found " + getTokenType(currToken().type));
			return false;
		}

		// if tokenValue is given
		if(tokenValue !== undefined && tokenValue !== null) {

			// check to make sure tokenValue matches
			if(currToken().value === tokenValue) {

				// then add the node
				this.addNode(currToken(), "leaf");

			// we should never reach this case, but just in case...
			} else {
				outError(parseTabs() + "ERROR: expected token type = " + tokenType + ", token value = " + tokenValue);
			}

		// if no tokenValue is given, just add the node
		} else {
			this.addNode(currToken(), "leaf");
		}

		// move to next token (suppress output)
		nextToken(true);

	};


	this.treeProgram = function() {

		// create super root
		this.addNode("Super Root", "branch");

		this.startBranch("Program");
		this.treeStatement();
		this.checkToken("EOF");
		this.endBranch();

	};

	this.treeStatement = function() {

		this.startBranch("Statement");

		switch(currToken().type) {

			case T_TYPE.PRINT:
				this.treePrint();
				break;

			case T_TYPE.ID:
				this.treeAssignment();
				break;

			case T_TYPE.KEYWORD:
				this.treeVarDecl();
				break;

			case T_TYPE.BRACE:
				this.checkToken("BRACE", "{");
				this.treeStatementList();
				this.checkToken("BRACE", "}");
				break;

			default: // error case
				outErrorExpected("Statement");

		}

		this.endBranch();

	};

	this.treePrint = function() {
		this.checkToken("PRINT");
		this.checkToken("BRACE", "(");
		this.treeExpr();
		this.checkToken("BRACE", ")");
	};

	this.treeAssignment = function() {
		this.checkToken("ID");
		this.checkToken("EQUAL");
		this.treeExpr();
	};

	this.treeVarDecl = function() {
		this.startBranch("VarDecl");
		this.checkToken("KEYWORD");
		this.checkToken("ID");
		this.endBranch();
	};

	this.treeStatementList = function() {
		if(currToken().value !== "}") {
			this.startBranch("StatementList");
			this.treeStatement();
			this.treeStatementList();
			this.endBranch();
		}
	};

	this.treeExpr = function() {

		this.startBranch("Expr");

		switch(currToken().type) {

			case T_TYPE.DIGIT:
				this.treeIntExpr();
				break;

			case T_TYPE.QUOTE:
				this.treeStringExpr();
				break;

			case T_TYPE.ID:
				this.checkToken("ID");
				break;

			default: // error case
				outErrorExpected("Expr");

		}

		this.endBranch();

	};

	this.treeIntExpr = function() {

		this.startBranch("IntExpr");

		this.checkToken("DIGIT");

		if(currToken().type === T_TYPE.OP) {
			this.checkToken("OP");
			this.treeExpr();
		}

		this.endBranch();

	};

	this.treeStringExpr = function() {
		this.startBranch("StringExpr");
		this.checkToken("QUOTE");
		this.treeCharList();
		this.checkToken("QUOTE");
		this.endBranch();
	};

	this.treeCharList = function() {

		switch(currToken().type) {

			case T_TYPE.CHAR:
				this.startBranch("CharList");
				this.checkToken("CHAR");
				this.treeCharList();
				this.endBranch();
				break;

			case T_TYPE.SPACE:
				this.startBranch("CharList");
				this.checkToken("SPACE");
				this.treeCharList();
				this.endBranch();
				break;

		}

	};

}

function buildParseTree() {

	out("<br />BUILDING PARSE TREE...");

	stage = "parseTree";

	// reset the index, numTabs
	index = 0;
	numTabs = 1;

	// create the parse tree
	var t = new Tree();
	t.treeProgram();

	if(errorCount > 0) {

		// plural or singular error?
		var error = "error";
		if(errorCount > 1) {
			error += "s";
		}

		out(tab + errorCount + " " + error + " found. Halting compiling.");

	} else {

		buildD3ParseTree(t);
		out(tab + '<a class="fancybox" href="#parse-tree">Click here to see visual parse tree</a>');
		out(tab + "Parse tree build successful!");

	}

	return t;

}