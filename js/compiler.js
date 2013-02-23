/******************************************************************
Compilers, Project 1
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

	if(errorCount > 0) {
		out("\nCompilation failed :(");
	} else {
		out("\nCompilation succeeded!");
	}

	// prevents browser from following link
	return false;

}