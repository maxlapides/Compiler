/******************************************************************
Compilers, Project 3
Author: Max Lapides

Script: Parser

******************************************************************/

// declare functions to be overridden later
// allows us to reference functions before they are defined
function parseStatement() {}
function parseStatementList() {}
function parsePrint() {}
function parseExpr() {}
function parseAssignment() {}
function parseVarDecl() {}
function parseIntExpr() {}
function parseStringExpr() {}
function parseCharList() {}
function parseSingleToken(expectedType, expectedOut) {}

function parse() {

	out("<br />PARSING...");

	stage = "parse";

	var success = true;

	// no reason to parse if we don't have at least two tokens
	// (the smallest possible program would be KEYWORD ID EOF, but a missing EOF is just a warning)
	if(tokens.length < 2) {

		outError(parseTabs() + "ERROR: cannot parse a Program with fewer than 2 tokens.");
		success = false;

	} else {

		// reset the index
		index = 0;

		// parse Statement
		success = parseStatement();

		if(success) {
			outVerbose(parseTabs() + "Expecting EOF");
		}

		// there is no reason to proceed here if we couldn't parse the Statement
		if(success && nextTokenExists()) {

			// parse EOF
			numTabs++;

			var needToAddEOF = false;

			// loop through extra tokens until we find the EOF
			while(nextTokenExists()) {

				// move to next token
				nextToken(false, true);

				// if it's not an EOF
				if(currToken().type !== T_TYPE.EOF) {

					// throw an error
					outErrorExpected("EOF");
					needToAddEOF = true;

				// otherwise, found it!
				} else {
					outVerbose(parseTabs() + "Found EOF");
					needToAddEOF = false;
					break;
				}

			}

			// we'll automatically resolve the missing EOF by adding the missing EOF token at this index
			if(needToAddEOF) {
				addToken({ type: T_TYPE.EOF });
				nextToken(true);
			}

			numTabs--;

			// if the program is valid, there should be no more tokens
			if(nextTokenExists()) {

				// move to the next token
				nextToken(true);

				// plural or singular?
				var extras = "token";
				if((tokens.length - index) > 1) {
					extras += "s";
				}

				// warning: we found extra tokens
				var extraTokensMsg = "WARNING: found " + (tokens.length - index) + " extra " + extras + ":";
				outWarning(extraTokensMsg);

				// print each extra token
				for( /* no variable to set */ ; index < tokens.length; index++) {

					// add 1 to index because we want to start counting the tokens at 1, not 0
					out(tab + tab + "[" + (index+1) + "] " + tokenToString(currToken()));

				}

			}

		// if there is no next token, the EOF is missing
		} else if(success) {

			outWarning(parseTabs() + "WARNING: EOF token not found");

			// we'll automatically resolve this warning by adding the missing EOF token
			addToken({ type: T_TYPE.EOF });

			// move index past this newly-added EOF token since we don't want to parse it
			index++;

		}

	}

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
			out(tab + errorCount + " parsing " + error + " found, " + warningCount + " " + warning + " found. Halting compiling.");

		} else {
			out(tab + errorCount + " parsing " + error + " found. Halting compiling.");
		}

	} else if(warningCount > 0) {

		out(tab + "Parse successful, but found " + warningCount + " " + warning + ".");

	} else {

		out(tab + "Parse successful!");

	}

	// reset warnings
	// we can proceed to parsing if there are warnings,
	// but we don't want to know about them anymore since they've already been reported
	warningCount = 0;

}

function parseStatement() {

	var success = true;

	outVerbose(parseTabs() + "Parsing Statement");

	numTabs++;

	outCurrToken();

	switch(currToken().type) {

		case T_TYPE.PRINT:
			success = parsePrint();
			break;

		case T_TYPE.ID:
			success = parseAssignment();
			break;

		case T_TYPE.KEYWORD:
			success = parseVarDecl();
			break;

		case T_TYPE.BRACE:
			if(currToken().value === "{") {
				success = parseStatementList();
			} else {
				outErrorExpected("{");
				success = false;
			}
			break;

		default: // error case
			outErrorExpected("Statement");
			success = false;

	}

	if(success) {
		outVerbose(parseTabs() + "Found Statement");
	} else {
		outVerbose(parseTabs() + "Did not find Statement");
	}

	numTabs--;

	return success;

}

function parseStatementList() {

	var success = true;

	outVerbose(parseTabs() + "Parsing StatementList");

	numTabs++;

	// we should now be on a left curly brace, move to next token
	nextToken(true);

	// loop until we reach an error or a right curly brace
	while(errorCount === 0 && currToken().value !== "}") {

		// parse as a Statement
		success = parseStatement();

		// if we could not successfully parse that Statement, break
		if(!success) {
			break;
		}

		// if the next token does not exist, we cannot continue
		if(!nextTokenExists()) {
			outError(parseTabs() + "ERROR: expected }, found no more tokens");
			success = false;
			break;
		}

		// move to next token
		nextToken(true);

	}

	if(success) {
		outCurrToken();
		outVerbose(parseTabs() + "Found StatementList");
	} else {
		outVerbose(parseTabs() + "Did not find StatementList");
	}

	numTabs--;

	return success;

}

function parsePrint() {

	var success = true;

	outVerbose(parseTabs() + "Parsing Print Statement");
	numTabs++;

	outVerbose(parseTabs() + "Expecting (");
	numTabs++;

	// should be BRACE, (
	nextToken();

	// if it's not...
	if(!(currToken().type === T_TYPE.BRACE && currToken().value === "(")) {

		// throw an error
		outErrorExpected("(");
		success = false;

	} else {
		outVerbose(parseTabs() + "Found (");
	}

	numTabs--;

	if(success) {
		success = parseExpr();
	}

	if(success) {

		outVerbose(parseTabs() + "Expecting )");
		numTabs++;

		// should be BRACE, )
		nextToken();

		// if it's not...
		if(!(currToken().type === T_TYPE.BRACE && currToken().value === ")")) {

			// throw an error
			outErrorExpected(")");
			success = false;

		}

		if(success) {
			outVerbose(parseTabs() + "Found )");
		} else {
			outVerbose(parseTabs() + "Did not find )");
		}

		numTabs--;

	}

	if(success) {
		outVerbose(parseTabs() + "Found Print Statement");
	} else {
		outVerbose(parseTabs() + "Did not find Print Statement");
	}

	numTabs--;

	return success;

}

function parseExpr() {

	var success = true;

	outVerbose(parseTabs() + "Expecting Expr");
	numTabs++;

	// should be an Expr
	nextToken();

	switch(currToken().type) {

		case T_TYPE.DIGIT:
			success = parseIntExpr();
			break;

		case T_TYPE.QUOTE:
			success = parseStringExpr();
			break;

		case T_TYPE.ID:
			outVerbose(parseTabs() + "Found identifier: " + currToken().value);
			break;

		default:
			// throw an error
			outErrorExpected("Expr");
			success = false;

	}

	if(success) {
		outVerbose(parseTabs() + "Found Expr");
	} else {
		outVerbose(parseTabs() + "Did not find Expr");
	}

	numTabs--;

	return success;

}

function parseAssignment() {

	var success = true;

	// we should never reach this case, but better safe than sorry!
	if(currToken().type !== T_TYPE.ID) {
		outError(parseTabs() + "ERROR: could not parse Assignment Statement.");
		success = false;
	}

	outVerbose(parseTabs() + "Expecting Assignment Statement");
	numTabs++;

	// parse equals sign
	if(success) {
		success = parseSingleToken(T_TYPE.EQUAL, "=");
	}

	// parse Expr
	if(success) {
		success = parseExpr();
	}

	if(success) {
		outVerbose(parseTabs() + "Found Assignment Statement");
	} else {
		outVerbose(parseTabs() + "Did not find Assignment Statement");
	}

	numTabs--;

	return success;

}

function parseVarDecl() {

	var success = true;

	outVerbose(parseTabs() + "Expecting VarDecl");
	numTabs++;

	// parse an identifier
	success = parseSingleToken(T_TYPE.ID, "identifier");

	if(success) {

		outVerbose(parseTabs() + "Found VarDecl");

	} else {

		outVerbose(parseTabs() + "Did not find VarDecl");

	}

	numTabs--;

	return success;

}

function parseIntExpr() {

	var success = true;

	outVerbose(parseTabs() + "Expecting IntExpr");
	numTabs++;

	outVerbose(parseTabs() + "Expecting operator or digit");
	numTabs++;

	// if it's a digit not followed by an operator we're pretty much done here!
	if(currToken().type === T_TYPE.DIGIT && (!nextTokenExists() || tokens[index + 1].type !== T_TYPE.OP)) {

		outVerbose(parseTabs() + "Found digit: " + currToken().value);
		numTabs--;

		outVerbose(parseTabs() + "Found IntExpr");
		numTabs--;

		// no need to proceed any further in this function
		return success;

	}

	// if this token is not an operator
	if(nextToken().type !== T_TYPE.OP) {

		// throw an error
		outErrorExpected("operator");
		success = false;

	} else {
		outVerbose(parseTabs() + "Found operator");
	}

	numTabs--;

	// expecting an Expr next
	success = parseExpr();

	if(success) {
		outVerbose(parseTabs() + "Found IntExpr");
	} else {
		outVerbose(parseTabs() + "Did not find IntExpr");
	}

	numTabs--;

	return success;

}

function parseStringExpr() {

	var success = true;

	outVerbose(parseTabs() + "Expecting StringExpr");
	numTabs++;

	success = parseCharList();

	// parse a quotation mark
	if(success) {
		success = parseSingleToken(T_TYPE.QUOTE, "quotation mark");
	}

	if(success) {
		outVerbose(parseTabs() + "Found StringExpr");
	} else {
		outVerbose(parseTabs() + "Did not find StringExpr");
	}

	numTabs--;

	return success;

}

function parseCharList() {

	var success = true;

	outVerbose(parseTabs() + "Expecting CharList");
	numTabs++;

	switch(nextToken(true).type) {

		case T_TYPE.CHAR:
			outCurrToken();
			success = parseCharList();
			break;

		case T_TYPE.SPACE:
			outCurrToken();
			success = parseCharList();
			break;

		case T_TYPE.QUOTE:
			index--; // back it up!
			break;

		default:
			outCurrToken();

			// throw an error
			outErrorExpected("char, space, or quotation mark");
			success = false;

	}

	if(success) {
		outVerbose(parseTabs() + "Found CharList");
	} else {
		outVerbose(parseTabs() + "Did not find CharList");
	}

	numTabs--;

	return success;

}

function parseSingleToken(expectedType, expectedOut) {

	var success = true;

	outVerbose(parseTabs() + "Expecting " + expectedOut);
	numTabs++;

	// should be expected token type
	nextToken();

	// if it's not...
	if(currToken().type !== expectedType) {

		// throw an error
		outErrorExpected(getTokenType(expectedType));
		success = false;

	}

	if(success) {
		outVerbose(parseTabs() + "Found " + expectedOut);
	} else {
		outVerbose(parseTabs() + "Did not find " + expectedOut);
	}

	numTabs--;

	return success;

}