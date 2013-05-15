/******************************************************************
Compilers, Project 3
Author: Max Lapides

Script: Code Generation

******************************************************************/

// instruction set
var LOAD_CONST	= "A9";
var LOAD_MEM	= "AD";
var STORE		= "8D";
var ADD			= "6D";
var LOADX_CONST	= "A2";
var LOADX_MEM	= "AE";
var LOADY_CONST = "A0";
var LOADY_MEM	= "AC";
var NO_OP		= "EA";
var BREAK		= "00";
var COMPARE		= "EC";
var BRANCH		= "D0";
var INCREMENT	= "EE";
var SYS_CALL	= "FF";

function toHex(x) {
	// integer
	if(typeof x === 'number' && x % 1 === 0) {
		return x.toString(16).toUpperCase();
	}
	// ASCII
	else {
		return toHex(x.charCodeAt(0));
	}
}

function toNegHex(x) {
	// two's complement
	return toHex(255 - x);
}

function CodeGenScope(parent) {
	this.id = curScopeId++;
	this.children = [];
	if(parent) {
		this.parent = parent;
	} else {
		this.parent = false;
	}
}

function CodeGen() {

	this.heapPos = 0;
	this.stackPos = 95;
	this.autoStaticDataId = -1;
	this.scopeRoot = new CodeGenScope();
	this.curScope = this.scopeRoot;

	this.getTempById = function(id, fullRecord, autoInit) {

		var staticDataEntry = false;
		var parentScopeExists = true;
		var currentScope = this.curScope;

		// search for this ID starting in the current scope and moving up through parent scopes
		while(currentScope) {

			// search through staticData table for this ID in this scope
			for(var i = 0; i < staticData.length; i++) {
				if(staticData[i].id === id && staticData[i].scope === currentScope.id) {
					staticDataEntry = staticData[i];
					if(autoInit) { staticData[i].init = true; }
					break;
				}
			}

			// if we found the entry in this scope, do not proceed with other scopes
			if(staticDataEntry) { break; }

			// otherwise, start searching in this scope's parent
			currentScope = currentScope.parent;

		}

		if(fullRecord) {
			return staticDataEntry;
		} else {
			return staticDataEntry.temp;
		}

	};

	this.getTempByTemp = function(temp) {
		for(var i = 0; i < staticData.length; i++) {
			if(staticData[i].temp === temp) {
				return staticData[i];
			}
		}
		return false;
	};

	this.getCurTemp = function() {
		var temp = "T" + staticData.length;
		while(temp.length < 4) {
			temp += "X";
		}
		return temp;
	};

	this.getCurTempJump = function() {
		return "J" + jumps.length;
	};

	this.pushTemp = function(id, autoInit) {

		var temp;

		if(id !== undefined) {
			temp = this.getTempById(id, false, autoInit);
		} else {
			temp = this.getCurTemp();
		}

		var temp1 = temp.slice(0, 2);
		var temp2 = temp.slice(2);
		this.push(temp1);
		this.push(temp2);
	};

	this.pushCurTemp = function() {
		return this.pushTemp();
	};

	this.pushNum = function(num) {
		num = num.toString();
		while(num.length < 2) {
			num = "0" + num;
		}
		this.push(num);
	};

	this.addStaticData = function(id, type) {

		// if no ID, auto-assign an ID
		if(!id) {
			id = ++this.autoStaticDataId;
		}

		staticData.push({
			temp	: this.getCurTemp(),
			id		: id,
			type    : type,
			scope	: this.curScope.id,
			init	: false
		});
	};

	this.recurseThroughChildren = function(treeRoot) {
		for(var i = 0; i < treeRoot.children.length; i++) {
			this.traverseTree(treeRoot.children[i]);
		}
	};

	this.push = function(toPush) {

		// do not proceed if errors already exist
		if(errorCount > 0) { return; }

		if(this.heapPos >= this.stackPos) {
			outError(parseTabs() + "ERROR: program too long (heap collided with stack).");
			return;
		}
		execEnviro[this.heapPos++] = toPush;
	};

	this.positionToString = function(position) {
		if(position === undefined) { return ""; } // this should never happen
		return " (line " + position.line + ", char " + position.char + ")";
	};

	this.whileIfHelper = function(treeRoot, whileLoop) {

		if(treeRoot.children[0].token.type === T_TYPE.BOOL) {
			this.push(LOADX_CONST);
			if(treeRoot.children[0].token.value === "true") {
				this.push("00");
			} else {
				this.push("01");
			}
			this.push(COMPARE);
			this.push(toHex(95));
			this.push("00");
		} else {
			this.traverseTree(treeRoot.children[0]);
		}

		this.push(BRANCH);
		this.push(this.getCurTempJump());

		var curJump = jumps.length;
		var startingHeapPos = this.heapPos;

		jumps.push({
			temp: this.getCurTempJump(),
			dist: 0
		});

		this.recurseThroughChildren(treeRoot.children[1]);

		if(whileLoop) {
			jumps[curJump].dist = toHex(this.heapPos - startingHeapPos + 7);
		} else {
			jumps[curJump].dist = toHex(this.heapPos - startingHeapPos);
		}

	};

	this.exprHelper = function(treeRoot, yReg, xReg) {

		var EXPR_LOAD_CONST = LOAD_CONST;
		var EXPR_LOAD_MEM = LOAD_MEM;
		if(yReg) {
			EXPR_LOAD_CONST = LOADY_CONST;
			EXPR_LOAD_MEM = LOADY_MEM;
		} else if(xReg) {
			EXPR_LOAD_CONST = LOADX_CONST;
			EXPR_LOAD_MEM = LOADX_MEM;
		}

		// string
		if(treeRoot.token === "string") {
			this.push(EXPR_LOAD_CONST);
			this.traverseTree(treeRoot);
		}

		// id
		else if(treeRoot.token.type === T_TYPE.ID) {
			this.push(EXPR_LOAD_MEM);
			this.pushTemp(treeRoot.token.value);
		}

		// digit
		else if(treeRoot.token.type === T_TYPE.DIGIT) {
			this.push(EXPR_LOAD_CONST);
			this.pushNum(treeRoot.token.value);
		}

		// boolean
		else if(treeRoot.token.type === T_TYPE.BOOL) {
			this.push(EXPR_LOAD_CONST);
			if(treeRoot.token.value === "true") {
				this.pushNum(1);
			} else {
				this.pushNum(0);
			}
		}

		// equal?
		else if(treeRoot.token === "equal?") {
			this.traverseTree(treeRoot);

			// load 0 (assume false)
			this.push(EXPR_LOAD_CONST);
			this.pushNum(0);

			// if comparison resulted is false, branch
			this.push(BRANCH);
			this.pushNum(2);

			// if true, load 1
			this.push(EXPR_LOAD_CONST);
			this.pushNum(1);
		}

		// operation
		else {
			this.traverseTree(treeRoot);

			// move sum to Y or X register
			if(yReg || xReg) {
				this.push(STORE);
				this.pushCurTemp();
				this.addStaticData(false, "int");
			}

			if(yReg) {
				this.push(LOADY_MEM);
			} else if(xReg) {
				this.push(LOADX_MEM);
			}

			if(yReg || xReg) {
				this.pushTemp(this.autoStaticDataId);
			}

		}

	};

	this.boolStatementError = function(statement) {
		var tokenType = getTokenType(statement.token.type);
		if(!tokenType) { tokenType = statement.token; }
		if(tokenType === "ID") {
			tokenType = this.getTempById(statement.token.value, true).type;
		}

		var errorPos = this.positionToString(statement.token.position);
		if(!errorPos) {
			errorPos = this.positionToString(statement.children[0].token.position);
		}
		outError("ERROR: cannot compare a " + tokenType + errorPos);
	};

	this.traverseTree = function(treeRoot) {

		// do not proceed if there are already errors
		if(errorCount > 0) {
			return;
		}

		switch(treeRoot.token) {

			case "block":
				this.curScope.children.push(new CodeGenScope(this.curScope));	// add a new child scope to current scope
				this.curScope = this.curScope.children.slice(-1)[0];			// set current scope to new child scope
				this.recurseThroughChildren(treeRoot);
				this.curScope = this.curScope.parent;							// reset current scope to parent scope
				break;

			case "declare":
				switch(treeRoot.children[0].token.value) {

					case "int":
						// this stuff seems extraneous
						/*
						this.push(LOAD_CONST);
						this.push("00");
						this.push(STORE);
						this.pushCurTemp();
						*/
						this.addStaticData(treeRoot.children[1].token.value, "int");
						break;

					case "string":
						this.addStaticData(treeRoot.children[1].token.value, "string");
						break;

					case "boolean":
						this.addStaticData(treeRoot.children[1].token.value, "int");
						break;

				}
				break;

			case "assign":
				var thisTemp = this.getTempById(treeRoot.children[0].token.value, true);
				// optimization: no need to store zeros
				if(thisTemp.init || !(treeRoot.children[1].token.value === 0 || treeRoot.children[1].token.value === "false")) {
					this.exprHelper(treeRoot.children[1]);
					this.push(STORE);
					this.pushTemp(treeRoot.children[0].token.value, true);
				}
				break;

			case "string":

				var str = treeRoot.children;

				// catch heap/stack collision
				if(this.heapPos >= (this.stackPos - str.length)) {
					outError("ERROR: program too long (stack collided with heap).");
					return;
				}

				execEnviro[this.stackPos] = BREAK;

				for(var i = str.length - 1; i >= 0; i--) {
					if(str[i].token.value) {
						execEnviro[--this.stackPos] = toHex(str[i].token.value);
					} else if(str[i].token.type === T_TYPE.SPACE) {
						execEnviro[--this.stackPos] = toHex(" ");
					}
				}

				this.push(toHex(this.stackPos));
				this.stackPos--;
				break;

			case "print":

				this.exprHelper(treeRoot.children[0], true);

				this.push(LOADX_CONST);
				if(this.getTempById(treeRoot.children[0].token.value, true).type === "string" || treeRoot.children[0].token === "string") {
					this.push("02");
				} else {
					this.push("01");
				}

				this.push(SYS_CALL);
				break;

			case "if":
				this.whileIfHelper(treeRoot);
				break;

			case "while":
				var startingHeapPos = this.heapPos;
				this.whileIfHelper(treeRoot, true);

				// X register = contents of memory location 0
				this.push(LOADX_CONST);
				this.push("00");

				// compare X register (content = 00) to contents of memory location 00
				// will ALWAYS evaluate to false because the first memory location is never = 00
				this.push(COMPARE);
				this.push("00");
				this.push("00");

				this.push(BRANCH);
				this.pushNum(toNegHex(this.heapPos - startingHeapPos));

				break;

			case "equal?":

				var boolStatement = treeRoot.children;

				// optimization: if the IF statement is in the form "ID == DIGIT" or "ID == BOOL", flip them
				if( boolStatement[0].token.type === T_TYPE.ID &&
					(boolStatement[1].token.type === T_TYPE.DIGIT || boolStatement[1].token.type === T_TYPE.BOOL) ) {
					boolStatement.reverse();
				}

				// optimization: if the IF statement is in the form "DIGIT == OP", flip them
				if(boolStatement[0].token.type === T_TYPE.DIGIT && boolStatement[1].token.type === T_TYPE.OP) {
					boolStatement.reverse();
				}

				// necessary (otherwise the X register gets overwritten and things get complicated)
				if( (boolStatement[0].token.type === T_TYPE.BOOL && boolStatement[1].token === "equal?") ||
					(boolStatement[0].token.type === T_TYPE.ID && boolStatement[1].token === "equal?")) {
					boolStatement.reverse();
				}

				switch(boolStatement[0].token.type) {

					case T_TYPE.ID:
						if(this.getTempById(boolStatement[0].token.value, true).type === "int") {
							this.push(LOADX_MEM);
							this.pushTemp(boolStatement[0].token.value);
						} else {
							this.boolStatementError(boolStatement[0]);
						}
						break;

					case T_TYPE.DIGIT:
						this.push(LOADX_CONST);
						this.pushNum(boolStatement[0].token.value);
						break;

					case T_TYPE.BOOL:
						this.push(LOADX_CONST);
						if(boolStatement[0].token.value === "true") {
							this.pushNum(1);
						} else {
							this.pushNum(0);
						}
						break;

					case T_TYPE.OP:
						this.exprHelper(boolStatement[0], false, true);
						break;

					default:
						if(boolStatement[0].token === "equal?") {
							if(boolStatement[1].token === "equal?") {
								this.exprHelper(boolStatement[0]);
							} else {
								this.exprHelper(boolStatement[0], false, true);
							}
						} else {
							this.boolStatementError(boolStatement[0]);
						}
						break;
				}

				var firstEqualAddress;
				if(boolStatement[0].token === "equal?" && boolStatement[1].token === "equal?") {
					this.push(STORE);
					this.pushCurTemp();
					this.addStaticData(false, "int");
					firstEqualAddress = this.autoStaticDataId;
				}

				switch(boolStatement[1].token.type) {

					case T_TYPE.ID:
						if(this.getTempById(boolStatement[1].token.value, true).type === "int") {
							this.push(COMPARE);
							this.pushTemp(boolStatement[1].token.value);
						} else {
							this.boolStatementError(boolStatement[1]);
						}
						break;

					case T_TYPE.DIGIT:
						this.push(LOAD_CONST);
						this.pushNum(boolStatement[1].token.value);
						this.push(STORE);
						this.pushCurTemp();
						this.addStaticData(false, "int");
						this.push(COMPARE);
						this.pushTemp(this.autoStaticDataId);
						break;

					case T_TYPE.BOOL:
						this.push(LOAD_CONST);

						if(boolStatement[1].token.value === "true") {
							this.pushNum(1);
						} else {
							this.pushNum(0);
						}

						this.push(STORE);
						this.pushCurTemp();
						this.addStaticData(false, "int");
						this.push(COMPARE);
						this.pushTemp(this.autoStaticDataId);
						break;

					case T_TYPE.OP:
						this.exprHelper(boolStatement[1]);
						this.push(STORE);
						this.pushCurTemp();
						this.addStaticData(false, "int");
						this.push(COMPARE);
						this.pushTemp(this.autoStaticDataId);
						break;

					default:
						if(boolStatement[1].token === "equal?") {
							if(boolStatement[0].token === "equal?") {
								this.exprHelper(boolStatement[1], false, true);
							} else {
								this.exprHelper(boolStatement[1]);
							}
						} else {
							this.boolStatementError(boolStatement[1]);
						}
						break;

				}

				if(boolStatement[0].token === "equal?" && boolStatement[1].token === "equal?") {
					this.push(COMPARE);
					this.pushTemp(firstEqualAddress);
				}

				break;

			default:
				if(treeRoot.token.type === T_TYPE.OP) {

					// WARNING: subtraction is not a thing we can do
					if(treeRoot.token.value === "-") {
						outWarning("WARNING: subtraction will be performed as addition.");
					}

					// operation
					if(treeRoot.children[1].token.type === T_TYPE.OP) {
						this.traverseTree(treeRoot.children[1]);
					}

					// digit
					else if(treeRoot.children[1].token.type === T_TYPE.DIGIT) {
						this.push(LOAD_CONST);
						this.pushNum(treeRoot.children[1].token.value);
					}

					// boolean
					else if(treeRoot.children[1].token.type === T_TYPE.BOOL) {
						this.push(LOAD_CONST);
						if(treeRoot.children[1].token.value === "true") {
							this.pushNum(1);
						} else {
							this.pushNum(0);
						}
					}

					// otherwise (not identifier)
					else if(treeRoot.children[1].token.type !== T_TYPE.ID) {
						outError("ERROR: cannot add a " + getTokenType(treeRoot.children[1].token.type));
					}

					// the value of the second branch should now be in the accumulator, save this value in memory
					// not necessary if we're simply loading an identifier because this is already stored in memory
					if(treeRoot.children[1].token.type !== T_TYPE.ID) {
						this.push(STORE);
						this.pushCurTemp();
						this.addStaticData(false, "int");
					}

					// add the value of branch 1 to branch 2
					this.push(LOAD_CONST);
					this.pushNum(treeRoot.children[0].token.value);
					this.push(ADD);
					if(treeRoot.children[1].token.type !== T_TYPE.ID) {
						this.pushTemp(this.autoStaticDataId);
					} else {
						this.pushTemp(treeRoot.children[1].token.value);
					}

				} else {
					this.recurseThroughChildren(treeRoot);
				}

				break;

		}

	};

	this.backPatch = function() {

		// don't even bother if there are already errors
		if(errorCount > 0) { return; }

		var newLoc, firstChar, jumpDist, staticElmt, staticLoc1, staticLoc2;

		// finish the program with a 00
		this.push(BREAK);

		// choose locations for each static data item
		for(var i = 0; i < staticData.length; i++) {

			// check for collisions
			if(execEnviro[this.heapPos]) {
				outError("ERROR: program too long (cannot allocate locations for data).");
			}

			newLoc = toHex(this.heapPos++);
			while(newLoc.length < 4) {
				newLoc = "0" + newLoc;
			}
			staticData[i].newLoc = newLoc;
		}

		// iterate through generated code, search for stuff to backpatch
		for(i = 0; i < execEnviro.length; i++) {

			// if this element doesn't exist, we can stop here
			if(!execEnviro[i]) { break; }

			firstChar = execEnviro[i].slice(0, 1);

			// backpatch jump
			if(firstChar === "J") {
				jumpDist = jumps[execEnviro[i].slice(1)].dist;
				while(jumpDist.length < 2) {
					jumpDist = "0" + jumpDist;
				}
				execEnviro[i] = jumpDist;
			}

			// backpatch static data
			else if(firstChar === "T") {
				staticElmt = this.getTempByTemp(execEnviro[i] + execEnviro[i+1]);
				staticLoc1 = staticElmt.newLoc.slice(0, 2);
				staticLoc2 = staticElmt.newLoc.slice(2);
				execEnviro[i] = staticLoc2;
				execEnviro[++i] = staticLoc1;
			}

		}

	};

	this.fillZeros = function() {
		for(var i = 0; i < 96; i++) {
			if(!execEnviro[i]) {
				execEnviro[i] = BREAK;
			}
		}
	};

}

function codeGeneration() {

	out("<br />GENERATING CODE...");

	stage = "codeGen";

	// reset the index, numTabs, curScopeId
	index = 0;
	numTabs = 0;
	curScopeId = 0;

	var c = new CodeGen();
	c.traverseTree(abstractTree.root);
	c.backPatch();
	c.fillZeros();

	// print generated code, separated by spaces, in the Fancybox
	codeGenFbox.innerHTML = execEnviro.join(" ");

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
	} else {

		out(tab + '<a class="fancybox-small" href="#code-output">Click here for generated code</a>');

		if(warningCount > 0) {
			out(tab + "Code generation successful, but found " + warningCount + " " + warning + ".");
		} else {
			out(tab + "Code generation successful!");
		}

	}

}