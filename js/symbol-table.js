/******************************************************************
Compilers, Project 3
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
		if(position === undefined) { return ""; } // this should never happen
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
			if(!inOpSubtree) {
				outVerbose(parseTabs() + "Marked " + symbolToLookup.value + " as initialized");
				symbol.initialized = true;
			}
		} else {
			error = "ERROR: undeclared variable " + symbolToLookup.value + this.positionToString(symbolToLookup.position);
			outError(parseTabs() + error);
			return false;
		}

		if(inOpSubtree && !symbol.initialized) {
			outWarning(parseTabs() + "WARNING: cannot perform an operation on an uninitialized variable" + this.positionToString(symbolToLookup.position));
		}

		// type checking

		if(symbol.type !== expectedType) {

			if(!expectedType) {
				error = "ERROR: cannot assign " + symbolToLookup.value + " to undeclared variable " + this.positionToString(symbolToLookup.position);
			}

			else if(inOpSubtree && symbol.type === "boolean") {
				error = "ERROR (type mismatch): cannot perform an operation on boolean " + symbolToLookup.value + this.positionToString(symbolToLookup.position);
			}

			else if(inOpSubtree) {
				error = "ERROR (type mismatch): cannot perform an operation on string " + symbolToLookup.value + this.positionToString(symbolToLookup.position);
			}

			else {
				error = "ERROR (type mismatch): " + symbolToLookup.value + " was declared " + symbol.type;
				error += ", assigned to " + expectedType + this.positionToString(symbolToLookup.position);
			}

			outError(parseTabs() + error);
			return false;
		}

		return true;

	};

	this.determineType = function(token) {

		if(token === "string") {
			return "string";
		}

		if(token === "int" || token.type === T_TYPE.OP || token.type === T_TYPE.DIGIT) {
			return "int";
		}

		if(token === "equal?" || token.type === T_TYPE.BOOL) {
			return "boolean";
		}

		if(token.type === T_TYPE.ID) {

			var symTabEntry = this.lookupSymbol(token.value);

			if(symTabEntry && symTabEntry.type === "int") {
				return "int";
			}

			else if(symTabEntry && symTabEntry.type === "string") {
				return "string";
			}

			else {
				return false;
			}

		}

		return false;

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

			case "print":
				if(treeRoot.children[0].token.type !== T_TYPE.ID) { break; } // no reason to proceed unless we're printing an identifier
				var symbol = this.lookupSymbol(treeRoot.children[0].token.value);
				if(!symbol) {
					outError(parseTabs() + "ERROR: cannot print an undeclared variable" + this.positionToString(treeRoot.children[0].token.position));
				} else if(!symbol.initialized) {
					outError(parseTabs() + "ERROR: cannot print an uninitialized variable" + this.positionToString(treeRoot.children[0].token.position));
				}
				break;

			case "equal?":
				var esymbol;
				var lastType = false;

				// if the two children nodes aren't of the same type
				if(treeRoot.children[0].token.type !== treeRoot.children[1].token.type) {

					// this is allowed when one of the nodes is an ID (to be tested below) or BOOL == equal? or when DIGIT == IntExpr
					// for example: if(true == (a == b)) or if(5 == 2 + 3)
					if( treeRoot.children[0].token.type !== T_TYPE.ID && treeRoot.children[1].token.type !== T_TYPE.ID &&
						!(treeRoot.children[0].token.type === T_TYPE.BOOL && treeRoot.children[1].token === "equal?") &&
						!(treeRoot.children[1].token.type === T_TYPE.BOOL && treeRoot.children[0].token === "equal?") &&
						!(treeRoot.children[0].token.type === T_TYPE.DIGIT && treeRoot.children[1].token.type === T_TYPE.OP) &&
						!(treeRoot.children[1].token.type === T_TYPE.DIGIT && treeRoot.children[0].token.type === T_TYPE.OP) ) {

						var type1 = getTokenType(treeRoot.children[0].token.type);
						var type2 = getTokenType(treeRoot.children[1].token.type);
						if(!type1) {
							type1 = treeRoot.children[0].token;
							if(type1 === "equal?") {
								type1 = "BooleanExpr";
							}
						}
						if(!type2) {
							type2 = treeRoot.children[1].token;
							if(type2 === "equal?") {
								type2 = "BooleanExpr";
							}
						}

						outError(parseTabs() + "ERROR: cannot compare a " + type1 + " to a " + type2 + this.positionToString(treeRoot.children[0].token.position));
						break;

					}

				}

				var equalChecker = treeRoot.children;
				if(equalChecker[0].token.type === T_TYPE.ID) {
					equalChecker.reverse();
				}

				for(var i = 0; i < 2; i++) {
					if(equalChecker[i].token.type === T_TYPE.ID) {
						esymbol = this.lookupSymbol(equalChecker[i].token.value);

						// catch error: compared types do not match
						if(lastType && lastType !== esymbol.type) {
							outError(parseTabs() + "ERROR: cannot compare a " + lastType + " to a " + esymbol.type + this.positionToString(equalChecker[i].token.position));
						}
						lastType = esymbol.type;

						// catch error: variable undeclared/uninitialized
						if(!esymbol) {
							outError(parseTabs() + "ERROR: cannot check equality of an undeclared variable" + this.positionToString(equalChecker[i].token.position));
						} else if(!esymbol.initialized) {
							outError(parseTabs() + "ERROR: cannot check equality of an uninitialized variable" + this.positionToString(equalChecker[i].token.position));
						}

					} else {
						switch(equalChecker[i].token.type) {
							case T_TYPE.DIGIT:
								lastType = "int";
								break;
							case T_TYPE.OP:
								lastType = "int";
								break;
							case T_TYPE.BOOL:
								lastType = "boolean";
								break;
							default:
								if(equalChecker[i].token === "equal?") {
									lastType = "boolean";
								}
								break;
						}
						this.traverseTree(equalChecker[i]);
					}
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

	// catch errors!

	// plural or singular warning?
	var warning = "warning";
	if(warningCount > 1) {
		warning += "s";
	}

	if(errorCount > 0) {

		// plural or singular error?
		var error = "error";
		if(errorCount > 1) {
			error += "s";
		}

		if(warningCount > 0) {
			out(tab + errorCount + " " + error + " found, " + warningCount + " " + warning + " found. Halting compiling.");

		} else {
			out(tab + errorCount + " " + error + " found. Halting compiling.");
		}

	} else if(warningCount > 0) {

		out(tab + "Symbol table build successful, but found " + warningCount + " " + warning + ".");

	} else {

		out(tab + "Symbol table build successful!");

	}

}