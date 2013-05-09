/******************************************************************
Compilers, Project 3
Author: Max Lapides

Script: Tests

******************************************************************/


/***********/
/*  !TEST  */
/***********/

// declare functions to be overridden later
function getTest1() {}
function getTest2() {}
function getTest3() {}
function getTest4() {}
function getTest5() {}
function getTest6() {}
function getTest7() {}
function getTest8() {}

function test(testNum) {

	reset();

	var testProgram = "";

	switch(testNum) {

		case 1:
			testProgram = getTest1();
			break;

		case 2:
			testProgram = getTest2();
			break;

		case 3:
			testProgram = getTest3();
			break;

		case 4:
			testProgram = getTest4();
			break;

		case 5:
			testProgram = getTest5();
			break;

		case 6:
			testProgram = getTest6();
			break;

		case 7:
			testProgram = getTest7();
			break;

		case 8:
			testProgram = getTest8();
			break;

	}

	// add test program to code editor
	editor.setValue(testProgram);

	return false;

}

function getTest1() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint i\n";
	testProgram += "\tstring i\n";
	testProgram += "\tstring c\n";
	testProgram += "\t{\n";
	testProgram += "\t\tc = \"xyz\"\n";
	testProgram += "\t}\n";
	testProgram += "\t{ { { c = 3 } } }\n";
	testProgram += "\tprint(i)\n";
	testProgram += "\tprint(c)\n";
	testProgram += "\tprint(\"done\")\n";
	testProgram += "} $";

	return testProgram;

}

function getTest2() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint x\n";
	testProgram += "\tx = 4 + y\n";
	testProgram += "\t{\n";
	testProgram += "\t\tstring y\n";
	testProgram += "\t\ty = \"yaycs\"\n";
	testProgram += "\t\tprint(y)\n";
	testProgram += "\t}\n";
	testProgram += "} $";

	return testProgram;

}

function getTest3() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint i\n";
	testProgram += "\ti = 7\n";
	testProgram += "\ti = 8\n";
	testProgram += "\t{\n";
	testProgram += "\t\ti = 1 + i\n";
	testProgram += "\t}\n";
	testProgram += "\t{\n";
	testProgram += "\t\tstring i\n";
	testProgram += "\t\ti = 2 + i\n";
	testProgram += "\t}\n";
	testProgram += "\tprint(i)\n";
	testProgram += "} $";

	return testProgram;

}

function getTest4() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tstring a\n";
	testProgram += "\t{\n";
	testProgram += "\t\tint a\n";
	testProgram += "\t\ta = 2\n";
	testProgram += "\t\tstring c\n";
	testProgram += "\t\t{\n";
	testProgram += "\t\t\tc = \"meow\"\n";
	testProgram += "\t\t\ta = \"abc\"\n";
	testProgram += "\t\t}\n";
	testProgram += "\t}\n";
	testProgram += "\t{\n";
	testProgram += "\t\ta = \"woah\"\n";
	testProgram += "\t\tint a\n";
	testProgram += "\t\ta = 3\n";
	testProgram += "\t\t{\n";
	testProgram += "\t\t\t{\n";
	testProgram += "\t\t\t\tint z\n";
	testProgram += "\t\t\t\tz = 7\n";
	testProgram += "\t\t\t}\n";
	testProgram += "\t\t}\n";
	testProgram += "\t}\n";
	testProgram += "} $";

	return testProgram;

}

function getTest5() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint i\n";
	testProgram += "\tstring c\n";
	testProgram += "\t{\n";
	testProgram += "\t\ti = 1\n";
	testProgram += "\t\tc = \"xyz\"\n";
	testProgram += "\t}\n";
	testProgram += "\t{ { { } } }\n";
	testProgram += "\tprint(i)\n";
	testProgram += "\tprint(c)\n";
	testProgram += "\tprint(\"done\")\n";
	testProgram += "} $";

	return testProgram;

}

function getTest6() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint x\n";
	testProgram += "\tint y\n";
	testProgram += "\ty = 3\n";
	testProgram += "\tx = 4 + y\n";
	testProgram += "\t{\n";
	testProgram += "\t\tstring y\n";
	testProgram += "\t\ty = \"yaycs\"\n";
	testProgram += "\t\tprint(y)\n";
	testProgram += "\t}\n";
	testProgram += "} $";

	return testProgram;

}

function getTest7() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint i\n";
	testProgram += "\ti = 7\n";
	testProgram += "\ti = 8\n";
	testProgram += "\t{\n";
	testProgram += "\t\ti = 1 + i\n";
	testProgram += "\t}\n";
	testProgram += "\t{\n";
	testProgram += "\t\tstring i\n";
	testProgram += "\t\ti = \"stringy\"\n";
	testProgram += "\t}\n";
	testProgram += "\tprint(i)\n";
	testProgram += "} $";

	return testProgram;

}

function getTest8() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tstring a\n";
	testProgram += "\t{\n";
	testProgram += "\t\tint a\n";
	testProgram += "\t\ta = 2\n";
	testProgram += "\t\tstring c\n";
	testProgram += "\t\t{\n";
	testProgram += "\t\t\tc = \"meow\"\n";
	testProgram += "\t\t}\n";
	testProgram += "\t}\n";
	testProgram += "\t{\n";
	testProgram += "\t\ta = \"woah\"\n";
	testProgram += "\t\tint a\n";
	testProgram += "\t\ta = 3\n";
	testProgram += "\t\t{\n";
	testProgram += "\t\t\t{\n";
	testProgram += "\t\t\t\tint z\n";
	testProgram += "\t\t\t\tz = 7\n";
	testProgram += "\t\t\t}\n";
	testProgram += "\t\t}\n";
	testProgram += "\t}\n";
	testProgram += "} $";

	return testProgram;

}