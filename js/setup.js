/******************************************************************
Compilers, Project 2
Author: Max Lapides

Script: Set Up

******************************************************************/

// Declare globals for JSHint:
/*global ace:true*/


/********************/
/* !ACE CODE EDITOR */
/********************/

// Initialize the Ace Code Editor - http://ace.ajax.org/
var editor = ace.edit("editor");
editor.getSession().setUseWrapMode(true);       // Wrap text!
editor.setTheme("ace/theme/tomorrow_night");    // So dark and mysterious!
editor.getSession().setMode("ace/mode/csharp"); // C# is close enough!


/*************/
/* !FANCYBOX */
/*************/

$(document).ready(function() {
	$(".fancybox").fancybox({
		width		: 900,
		autoHeight	: true,
		autoSize	: false
	});
});


/*********************/
/* !GLOBAL VARIABLES */
/*********************/

// constants
var output = document.getElementById("output");
var parseTreeFbox = document.getElementById("parse-tree");
var abstractTreeFbox = document.getElementById("abstract-tree");
var tab = "&nbsp;&nbsp;&nbsp;";
var verboseCheck = document.getElementById("verbose");
var EOF = "$";

// global variables
var sourceCode;
var outMsg;
var verbose;
var index;
var errorCount;
var warningCount;
var stage;

// lexer variables
var tokens;
var errantChars;
var lineCount;
var charsBeforeThisLine;
var lexingCharExpr;

// parser variables
var numTabs;
var symbolTable;

// parse tree variables
var parseTree;
var nodeId;
var abstractTree;

// pseudo-enumeration for token types
var T_TYPE = {
	DIGIT	: 0,
	ID		: 1,
	OP		: 2,
	EOF		: 3,
	KEYWORD	: 4,
	PRINT	: 5,
	EQUAL	: 6,
	BRACE	: 7,
	QUOTE	: 8,
	CHAR	: 9,
	SPACE	: 10
};