/******************************************************************
Compilers, Project 1
Author: Max Lapides

Script: Helper Functions

******************************************************************/


/********************/
/* !GENERAL HELPERS */
/********************/

// resets the compiler to the default settings and clears output
function reset() {

	// clear output
	output.innerHTML = "";

	// global variables
	sourceCode = editor.getValue();
	verbose = verboseCheck.checked;
	index = 0;
	errorCount = 0;
	warningCount = 0;

	// lexer variables
	tokens = [];
	errantChars = "";
	lineCount = 1;
	charsBeforeThisLine = -1;
	lexingCharExpr = false;

	// parser variables
	numTabs = 1;
	symbolTable = [];
}

// outputs given string
function out(msg) {
    output.innerHTML += msg + "<br />";
}

// outputs given string, increments error counter
function outError(msg) {

	// wrap in <span> for formatting
	msg = '<span class="error">' + msg + '</span>';

	if(verbose && stage === "parse") {
		out(msg);
	} else {
		out(tab + msg);
	}

	errorCount++;
}

// outputs given string, increments warning counter
function outWarning(msg) {

	// wrap in <span> for formatting
	msg = '<span class="warning">' + msg + '</span>';

	out(tab + msg);

	warningCount++;
}

// same as out(), but only outputs if verbose is on
function outVerbose(msg) {
	if(verbose) {
		out(msg);
	}
}

// find the name of the given token type
function getTokenType(num) {

	// loop through all token types
	for(var type in T_TYPE) {

		// until we find the token type we're looking for
		if(T_TYPE[type] === num) {
			return type;
		}
	}

}

// prepare token to be output
function tokenToString(token) {

	var dump = "Type: " + getTokenType(token.type);

	// if this token has a value, also output that
	if(token.value !== undefined) {
		dump += ", Value: " + token.value;
	}

	return dump;

}

// same as tokenToString(), but prefixed with the index of the given token
function tokenToStringIndexed(token) {
	// add 1 to index because we want to start counting the tokens at 1, not 0
	return "[" + (index+1) + "] " +  tokenToString(token);
}


/****************/
/* !LEX HELPERS */
/****************/

// get the current character when iterating over sourceCode
function currChar() {
	return sourceCode[index];
}

// check if the next character exists
function nextCharExists() {

	// next character exists if the current index is less than the length of the source code
	// since indexing starts at zero, we need to add 1
	return ((index + 1) < sourceCode.length);
}

// get the next character when iterating over sourceCode
function nextChar() {

	// if the current character is the last character,
	// the next character doesn't exist
	return sourceCode[index + 1];

}

function addToken(token, location) {

	// if we were not given a location in the tokens array to add this token
	if(location === undefined) {

		// just add it at the end of the array
		tokens.push(token);
		outVerbose(tab + tab + "Token " + tokens.length + " added -> " + tokenToString(token));

	} else {

		// add tokens to tokens array at index location, remove 0 items
		tokens.splice(location, 0, token);
		outVerbose(tab + tab + "Token " + (location + 1) + " added -> " + tokenToString(token) + "; all following token indexes incremented");

	}

}

// given an index of total items already iterated over, find the current character index on this line
function lineIndex() {
	return (index - charsBeforeThisLine);
}

// return the line and character where an error was found
function errorLocation() {
	return " (line " + lineCount + ", char " + lineIndex() + ")";
}

// toggle whether we're currently lexing a CharExpr
function toggleCharExpr() {
	lexingCharExpr = !lexingCharExpr;
}

// used to verify KEYWORDs are entered properly
function checkKeyword(type) {

	var checkKeywordError = false;
	var keywordSoFar = "";

	// loop through the characters in the identifier type name
	// (skip the first character since that character is already verified)
	for(var j = 1; j < type.length; j++, index++) {

		outVerbose(tab + 'Expecting: ' + type[j]);

		keywordSoFar += currChar();

		// check if next character is incorrect
		if(nextCharExists() && nextChar() !== type[j]) {

			// set error flag
			checkKeywordError = true;

			// skipping to next character
			index++;

			// verbose output
			outVerbose(tab + tab + 'Did not find: ' + type[j]);

			// break out of this for loop
			break;
		}

		outVerbose(tab + tab + 'Found: ' + type[j]);

	}

	// if we did not verify the identifier type name was entered correctly
	if(checkKeywordError) {

		// look for all of the rest of the characters in this word
		while(currChar() && !currChar().match(/\s|\)|\}/)) {
			outVerbose(tab + "Lexing: " + currChar());
			keywordSoFar += currChar();
			index++;
		}

		// since the while loop ended one character after the word, we want to rewind the index one character
		index--;

		if(verbose) {
			outError(tab + 'ERROR: "' + keywordSoFar + '" is not a valid keyword' + errorLocation());
		} else {
			outError('ERROR: "' + keywordSoFar + '" is not a valid keyword' + errorLocation());
		}

	} else {

		// we're going to keep track of any errant characters that follow this identifier type
		errantChars = "";

		// while we're not yet at the end of the string
		//   and the following character is not a whitespace character or ) or }
		while(nextCharExists() && !nextChar().match(/\s|\)|\}/)) {

			// start parsing the next character
			index++;

			// verbose output
			outVerbose(tab + "Lexing: " + currChar());

			// add this character to this list of errant characters
			errantChars += currChar();
		}

		// if we found characters after the identifier name (besides whitespace)
		if(errantChars.length) {

			if(verbose) {
				outError(tab + 'ERROR: "' + type + errantChars + '" is not a valid keyword' + errorLocation());
			} else {
				outError('ERROR: "' + type + errantChars + '" is not a valid keyword' + errorLocation());
			}

		// otherwise, all is good!
		} else {

			// add to tokens array
			addToken({
				type: T_TYPE.KEYWORD,
				value: type
			});

		}

	}

}

// gets the name that we'll output for the current character
function currCharName() {

	if(currChar() === "\n") {
		return "newline";
	} else if(currChar() === "\t") {
		return "tab";
	} else if(currChar() === " ") {
		return "space";
	} else {
		return currChar();
	}

}


/******************/
/* !PARSE HELPERS */
/******************/

// used to create indentations that reflect the Power of Recursion
function parseTabs() {
	var tabs = "";

	if(verbose) {
		for(var j = 0; j < numTabs; j++) {
			tabs += tab;
		}
	}

	return tabs;
}

function nextTokenExists() {

	// next token exists if the current index is less than the length of the source code
	// since indexing starts at zero, we need to add 1
	return ((index + 1) < tokens.length);
}

// returns the current token
function currToken() {
	return tokens[index];
}

// outputs the current token
function outCurrToken() {
	outVerbose(parseTabs() + "Parsing: " + tokenToStringIndexed(currToken()));
}

// moves pointer to next token and optionally prints it out
function nextToken(noOut, forceOut) {

	if(nextTokenExists()) {

		index++;

		// sometimes this function will be called after a fatal error occurs
		// when that happens, we don't want to output any information about further tokens
		if(forceOut || (!noOut && errorCount === 0)) {
			outCurrToken();
		}

		return currToken();

	// if there is no next token, incrementing the index is going to cause out-of-bound issues
	} else {
		return false;
	}

}

// returns a string that reflects what the current token number is (starting counting tokens at 1)
function tokenNumOut() {
	return " (token " + (index+1) + ")";
}

function outErrorExpected(expected) {

	numTabs++;

	if(currToken().value) {
		outError(parseTabs() + "ERROR: expected " + expected + ", found " + currToken().value + tokenNumOut());
	} else {
		outError(parseTabs() + "ERROR: expected " + expected + ", found " + getTokenType(currToken().type) + tokenNumOut());
	}

	numTabs--;

}

function outWarningExpected(expected) {

	numTabs--;

	if(currToken().value) {
		outWarning(parseTabs() + "WARNING: expected " + expected + ", found " + currToken().value + tokenNumOut());
	} else {
		outWarning(parseTabs() + "WARNING: expected " + expected + ", found " + getTokenType(currToken().type));
	}

	numTabs++;

}

function inSymbolTable(id) {

	// iterate over all symbols in Symbol Table
	for(var j = 0; j < symbolTable.length; j++) {

		// did we find it?
		if(symbolTable[j].id === id) {
			return true;
		}

	}

	// couldn't find it!
	return false;

}

function removeFromSymbolTable(id) {

	// iterate over all symbols in Symbol Table
	for(var j = 0; j < symbolTable.length; j++) {

		// did we find it?
		if(symbolTable[j].id === id) {
			symbolTable.splice(j, 1); // at index j, remove 1 element
			return true;
		}

	}

	// couldn't find it!
	return false;

}

function addToSymbolTable(id, type) {

	var alreadyInTable = inSymbolTable(id);

	// if it is already in the symbol table and we're given a type, we need to overwrite the old value in the symbol table
	if(alreadyInTable && type !== undefined) {
		removeFromSymbolTable(id);
		alreadyInTable = false;
	}

	// if this id is not already in the symbol table
	if(!alreadyInTable) {

		// add to symbol table
		symbolTable.push({
			id: id,
			type: type
		});

		// if we were given a type (KEYWORD)
		if(type !== undefined) {
			outVerbose(parseTabs() + "Adding to Symbol Table: ID = " + id + ", TYPE = " + type);

		// otherwise, we weren't given a type (KEYWORD)
		} else {
			outVerbose(parseTabs() + "Adding to Symbol Table: ID = " + id);
		}

	}

}