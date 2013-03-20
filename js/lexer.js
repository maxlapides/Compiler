/******************************************************************
Compilers, Project 1
Author: Max Lapides

Script: Lexer

******************************************************************/


function lex() {

	out("<br />LEXING...");

	stage = "lex";

	// iterate through the source code, one character at a time
	for(index = 0; index < sourceCode.length; index++) {

		// verbose output
		outVerbose(tab + "Lexing: " + currCharName());

		// type: digit
		if(!isNaN(parseInt(currChar(), 10))) {

			// add to tokens array
			addToken({
				type: T_TYPE.DIGIT,
				value: parseInt(currChar(), 10) // convert this string to an integer (base 10)
			});

		// type: char
		} else if(lexingCharExpr && currChar().match(/[a-z]/)) {

			// add to tokens array
			addToken({
				type: T_TYPE.CHAR,
				value: currChar()
			});

		// error case: lexing a CharExpr, but found a bad character
		} else if(lexingCharExpr && !currChar().match(/[a-z|"]/)) {

			if(verbose) {
				outError(tab + 'ERROR: ' + currCharName() + ' is not valid in a CharExpr' + errorLocation());
			} else {
				outError('ERROR: ' + currCharName() + ' is not valid in a CharExpr' + errorLocation());
			}

		// type: identifier type (int)
		// if this character is "i", a next character exists, and that character is not a-z
		} else if(currChar() === "i" && nextCharExists() && nextChar().match(/[a-z]/)) {

			checkKeyword("int");

		// type: identifier type (char)
		// if this character is "c", a next character exists, and that character is not a-z
		} else if(currChar() === "c" && nextCharExists() && nextChar().match(/[a-z]/)) {

			checkKeyword("char");

		// type: id
		} else if(currChar().match(/[a-z]/)) {

			// we're going to keep track of any errant characters that follow this character
			errantChars = currChar();

			// while we're not yet at the end of the string
			//   and the following character is a-z
			while(nextCharExists() && nextChar().match(/[a-z]/)) {
				++index;
				outVerbose(tab + "Lexing: " + currChar());
				errantChars += currChar();
			}

			// if we found errant characters
			if(errantChars !== currChar()) {

				if(verbose) {
					outError(tab + 'ERROR: "' + errantChars + '" is not valid' + errorLocation());
				} else {
					outError('ERROR: "' + errantChars + '" is not valid' + errorLocation());
				}

			} else {

				// add to tokens array
				addToken({
					type: T_TYPE.ID,
					value: currChar()
				});

			}

		// type: operator
		} else if(currChar() === "+" || currChar() === "-") {

			// add to tokens array
			addToken({
				type: T_TYPE.OP,
				value: currChar()
			});

		// type: eof
		} else if(currChar() === "$") {

			// add to tokens array
			addToken({
				type: T_TYPE.EOF
			});

			// if there are more characters after this one
			// and the following characters are not all whitespace (because we don't even care to report that)
			if(nextCharExists() && !sourceCode.slice(++index).match(/^[\s]*$/)) {

				if(verbose) {
					outWarning(tab + 'WARNING: extra code after EOF: "' + sourceCode.slice(index) + '"' + errorLocation());
				} else {
					outWarning('WARNING: extra code after EOF: "' + sourceCode.slice(index) + '"' + errorLocation());
				}

			}

			// we've reached an EOF, so no need to continue lexing
			break;

		// type: print
		} else if(currChar() === "P") {

			// add to tokens array
			addToken({
				type: T_TYPE.PRINT
			});

		// type: equals sign
		} else if(currChar() === "=") {

			// add to tokens array
			addToken({
				type: T_TYPE.EQUAL
			});

		// type: braces (curly braces, parentheses)
		} else if(currChar().match(/[\{\}\(\)]/)) { // yeah, I know this regex is obnoxious but it's so concise!

			// add to tokens array
			addToken({
				type: T_TYPE.BRACE,
				value: currChar()
			});

		// type: quotation mark
		} else if(currChar() === '"') {

			// toggle whether we're lexing a CharExpr
			toggleCharExpr();

			// add to tokens array
			addToken({
				type: T_TYPE.QUOTE
			});

		// type: newline
		} else if(currChar() === "\n") {

			// track what line we're on
			lineCount++;

			// adjust the characters before this line to equal
			// the total number of characters we have already iterated over
			charsBeforeThisLine = index;

		// otherwise, we can't lex this character (ignoring whitespace)
		} else if(!currChar().match(/\s/)) {

			if(verbose) {
				outError(tab + 'ERROR: could not lex "' + currChar() + '"' + errorLocation());
			} else {
				outError('ERROR: could not lex "' + currChar() + '"' + errorLocation());
			}

		}

	}

	// output tokens
	// (only if verbose is off because verbose mode outputs tokens as they are created)
	if(!verbose && tokens.length) {

		out(tab + "Tokens:");

		for(var j = 0; j < tokens.length; j++) {
			// add 1 to j because we want to start counting the tokens at 1, not 0
			out(tab + tab + "[" + (j+1) + "] " + tokenToString(tokens[j]));
		}

	// error if no tokens were created
	} else if(!tokens.length) {

		if(verbose) {
			outError("ERROR: no tokens created");
		} else {
			outError(tab + "ERROR: no tokens created");
		}

	}

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
			out(tab + errorCount + " lexing " + error + " found, " + warningCount + " " + warning + " found. Halting compiling.");

		} else {
			out(tab + errorCount + " lexing " + error + " found. Halting compiling.");
		}

	} else if(warningCount > 0) {

		out(tab + "Lex successful, but found " + warningCount + " " + warning + ".");

	} else {

		out(tab + "Lex successful!");

	}

	// reset warnings
	// we can proceed to parsing if there are warnings,
	// but we don't want to know about them anymore since they've already been reported
	warningCount = 0;

}