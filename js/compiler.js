/******************************************************************
Compilers, Project 3
Author: Max Lapides

Script: The Compiler

******************************************************************/


/**************/
/*  !COMPILE  */
/**************/

function startCompile() {

	// fresh start
	reset();

	out("Compilation initiated!");

	// run the lexer
	lex();

	// if no errors, run the parser
	if(errorCount === 0) {
		parse();
	}

	// if no errors, build the parse tree
	if(errorCount === 0) {
		buildParseTree();
	}

	// if no errors, build the abstract syntax tree
	if(errorCount === 0) {
		buildAbstractTree();
	}

	// if no errors, build the symbol table
	if(errorCount === 0) {
		buildSymbolTable();
	}

	if(errorCount > 0) {
		out("<br />Compilation failed :(");
	} else {
		out("<br />Compilation succeeded!");
	}

	// put output in output box
	output.innerHTML += outMsg;

	// prevents browser from following link
	return false;

}