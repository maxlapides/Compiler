/******************************************************************
Compilers, Project 2
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
	testProgram += "\tint a\n";
	testProgram += "\ta + 3\n";
	testProgram += "} $";

	return testProgram;

}

function getTest2() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint a\n";
	testProgram += "\tstring b\n";
	testProgram += "\tb = 3\n";
	testProgram += "\t{\n";
	testProgram += "\t\tc = \"hi!\"\n";
	testProgram += "\t\tprint(c)\n";
	testProgram += "\t}\n";
	testProgram += "\tc = b\n";
	testProgram += "\tc = 4 + c\n";
	testProgram += "} $";

	return testProgram;

}

function getTest3() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint a\n";
	testProgram += "\ta = 2\n";
	testProgram += "\t{\n";
	testProgram += "\t\tint b\n";
	testProgram += "\t\tb = 3\n";
	testProgram += "\tprint(2 + a)\n";
	testProgram += "\tprint(b)\n";
	testProgram += "} $";

	return testProgram;

}

function getTest4() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint i\n";
	testProgram += "\tstring c\n";
	testProgram += "\t{\n";
	testProgram += "\t\ti = 2\n";
	testProgram += "\t\tc = 3\n";
	testProgram += "\t}\n";
	testProgram += "\tprint(int x)\n";
	testProgram += "} $";

	return testProgram;

}

function getTest5() {

	var testProgram;

	testProgram = "int a $";

	return testProgram;

}

function getTest6() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint a\n";
	testProgram += "\tstring b\n";
	testProgram += "\tb = 3\n";
	testProgram += "\t{\n";
	testProgram += "\t\tc = \"hello world\"\n";
	testProgram += "\t\tprint(c)\n";
	testProgram += "\t\t{ { x = 4 } }\n";
	testProgram += "\t}\n";
	testProgram += "\tc = b\n";
	testProgram += "\tc = 4 + c\n";
	testProgram += "\tstring c\n";
	testProgram += "} $";

	return testProgram;

}

function getTest7() {

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

function getTest8() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tstring x\n";
	testProgram += "\tx = \"woot\"\n";
	testProgram += "\tstring y\n";
	testProgram += "\ty = x\n";
	testProgram += "\tprint(y)\n";
	testProgram += "\tint z\n";
	testProgram += "\tz = 2 + \"two\"\n";
	testProgram += "} $";

	return testProgram;

}