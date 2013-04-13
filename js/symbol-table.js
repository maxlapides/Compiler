/******************************************************************
Compilers, Project 2
Author: Max Lapides

Script: Symbol Table

******************************************************************/

function SymbolTableElmt(id, type, position) {
	this.id = id;
	this.type = type;
	this.position = position;
	this.initialized = false;

	this.print = function() {
		return " ID: " + this.id + ", type: " + this.type;
	};

}

function SymbolTableScope(parent) {

	this.id = curScopeId++;
	if(parent) { this.parent = parent; } else { this.parent = null; }
	this.elmts = [];
	this.children = [];

	// output whenever "constructor" is called
	outVerbose(parseTabs() + "Starting scope " + this.id);

	this.checkForUninitialized = function() {

		// iterate through the identifiers in this scope
		for(var i = 0; i < this.elmts.length; i++) {

			// if this identifier is uninitialized
			if(this.elmts[i].initialized === false) {

				// add it to the array of uninitialized identifiers
				uninitialized.push({
					elmt: this.elmts[i],
					scope: this.id
				});

			}

		}

		// recursively call for each child scope
		for(var j = 0; j < this.children.length; j++) {
			this.children[j].checkForUninitialized();
		}

	};

	this.print = function() {

		// skip empty scopes
		if(this.elmts.length !== 0) {

			out(tab + tab +  "Scope " + this.id);

			out("<table>", true);
			out("<tr><th>ID</th><th>TYPE</th><th>LINE</th><th>CHAR</th><th>INITIALIZED</th></tr>", true);

			var curLine, j, k;

			// iterate through each element in this scope
			for(k = 0; k < this.elmts.length; k++) {

				curLine  = "<tr><td>" + this.elmts[k].id + "</td><td>" + this.elmts[k].type + "</td>";
				curLine += "<td>" + this.elmts[k].position.line + "</td><td>" + this.elmts[k].position.char + "</td><td>";
				if(this.elmts[k].initialized) {
					curLine += "TRUE";
				} else {
					curLine += "FALSE";
				}
				curLine += "</td></tr>";

				out(curLine, true);

			}

			out("</table>", true);

		}

		for(var i = 0; i < this.children.length; i++) {
			this.children[i].print();
		}

	};

}

function SymbolTable() {

	this.root = new SymbolTableScope();
	this.curScope = this.root;

	this.startScope = function() {
		var newScope = new SymbolTableScope(this.curScope);
		this.curScope.children.push(newScope);
		this.curScope = newScope;
		numTabs++;
	};

	this.endScope = function() {
		numTabs--;
		outVerbose(parseTabs() + "Ending scope " + this.curScope.id);
		this.curScope = this.curScope.parent;
	};

	this.lookupSymbol = function(symbolToLookup) {

		var symbol = false;

		var checkingScope = this.curScope;
		while(checkingScope) {
			for(var symbolElmt in checkingScope.elmts) {
				if(checkingScope.elmts[symbolElmt].id === symbolToLookup) {
					symbol = checkingScope.elmts[symbolElmt];
					break;
				}
			}
			if(symbol) {
				outVerbose(parseTabs() + "Found " + symbol.type + " " + symbolToLookup + " in symbol table at scope " + checkingScope.id);
				break;
			} else {
				checkingScope = checkingScope.parent;
			}
		}

		return symbol;

	};

	this.positionToString = function(position) {
		return " (line " + position.line + ", char " + position.char + ")";
	};

	this.addElmt = function(id, type, position) {

		var alreadyDeclared = false;
		for(var symbolElmt in this.curScope.elmts) {
			if(this.curScope.elmts[symbolElmt].id === id) {
				alreadyDeclared = true;
				break;
			}
		}

		// if the symbol was already declared in this scope, that's bad
		if(alreadyDeclared) {
			outError(parseTabs() + "ERROR: variable " + id + " already declared in scope " + this.curScope.id + this.positionToString(position));
			return false;
		}

		var newElmt = new SymbolTableElmt(id, type, position);

		outVerbose(parseTabs() + "Added to symbol table -> " + newElmt.print());
		this.curScope.elmts.push(newElmt);
	};

	this.recurseThroughChildren = function(treeRoot) {
		for(var i = 0; i < treeRoot.children.length; i++) {
			this.traverseTree(treeRoot.children[i]);
		}
	};

	this.checkSymbol = function(symbolToLookup, expectedType, inOpSubtree) {

		// look up symbol

		var symbol = this.lookupSymbol(symbolToLookup.value);
		var error;

		if(symbol) {
			symbol.initialized = true;
		} else {
			error = "ERROR: undeclared variable -> " + symbolToLookup.value + this.positionToString(symbolToLookup.position);
			outError(parseTabs() + error);
			return false;
		}

		// type checking

		if(symbol.type !== expectedType) {

			if(inOpSubtree) {
				error = "ERROR (type mismatch): cannot add string " + symbolToLookup.value + " to an int" + this.positionToString(symbolToLookup.position);
			} else {
				error = "ERROR (type mismatch): " + symbolToLookup.value + " was declared " + symbol.type;
				error += ", assigned to " + expectedType + this.positionToString(symbolToLookup.position);
			}

			outError(parseTabs() + error);
			return false;
		}

	};

	this.determineType = function(token) {

		if(token.type === T_TYPE.OP) {
			return "int";
		}

		else if(token.type === T_TYPE.DIGIT) {
			return "int";
		}

		else {
			return "string";
		}

	};

	this.traverseTree = function(treeRoot) {

		switch(treeRoot.token) {

			case "block":
				this.startScope();
				this.recurseThroughChildren(treeRoot);
				this.endScope();
				break;

			case "declare":
				this.addElmt(
					treeRoot.children[1].token.value,
					treeRoot.children[0].token.value,
					treeRoot.children[0].token.position
				);
				break;

			case "assign":
				this.checkSymbol(treeRoot.children[0].token, this.determineType(treeRoot.children[1].token));
				if(treeRoot.children[1]) {
					this.traverseTree(treeRoot.children[1]);
				}
				break;

			default:
				if(treeRoot.token.type === T_TYPE.OP) {

					if(treeRoot.children[1].token.type === T_TYPE.OP) {
						this.traverseTree(treeRoot.children[1]);

					} else if(treeRoot.children[1].token.type === T_TYPE.ID) {
						this.checkSymbol(treeRoot.children[1].token, "int", true);

					} else if(treeRoot.children[1].token === "string") {
						var posn = treeRoot.children[1].children[0].token.position;
						posn.char--; // decrement to account for QUOTE character
						var error = 'ERROR (type mismatch): cannot add string to an int';
						error += this.positionToString(posn);
						outError(parseTabs() + error);
					}
				}
				this.recurseThroughChildren(treeRoot);
				break;

		}

	};

	this.checkForUninitialized = function() {

		numTabs = 1;

		outVerbose(parseTabs() + "Checking for uninitialized identifiers...");

		// check for uninitialized identifiers in each scope level
		this.root.checkForUninitialized();

		// output success/error messages
		if(uninitialized.length === 0) {

			numTabs++;
			outVerbose(parseTabs() + "No uninitialized identifiers found!");
			numTabs--;

		} else {
			var warning;
			for(var i = 0; i < uninitialized.length; i++) {
				warning  = "WARNING: uninitialized variable " + uninitialized[i].elmt.id + " in scope " + uninitialized[i].scope;
				warning += " " + this.positionToString(uninitialized[i].elmt.position);
				outWarning(parseTabs() + warning);
			}
		}

	};

	this.print = function() {
		out(tab + "Symbol Table:");
		this.root.print();
	};

}

function buildSymbolTable() {

	out("<br />BUILDING SYMBOL TABLE...");

	stage = "symbolTable";

	// reset the tabs
	numTabs = 1;

	symbolTable = new SymbolTable();
	numTabs++;
	symbolTable.traverseTree(abstractTree.root);
	symbolTable.endScope();

	symbolTable.checkForUninitialized();

	symbolTable.print();

	if(errorCount > 0) {

		// plural or singular error?
		var error = "error";
		if(errorCount > 1) {
			error += "s";
		}

		out(tab + errorCount + " " + error + " found. Halting compiling.");

	} else {

		out(tab + "Symbol table build successful!");

	}

}