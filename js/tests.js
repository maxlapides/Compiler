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
	testProgram += "\tint a\n";
	testProgram += "\ta = 1\n";
	testProgram += "\t{\n";
	testProgram += "\t\tint a\n";
	testProgram += "\t\ta = 2\n";
	testProgram += "\t\tprint(a)\n";
	testProgram += "\t}\n";
	testProgram += "\tstring b\n";
	testProgram += "\tb = \"alan\"\n";
	testProgram += "\tif(a == 1) {\n";
	testProgram += "\t\tprint(b)\n";
	testProgram += "\t}\n";
	testProgram += "\tstring c\n";
	testProgram += "\tc = \"james\"\n";
	testProgram += "\tb = \"blackstone\"\n";
	testProgram += "\tprint(b)\n";
	testProgram += "} $";

	return testProgram;

}

function getTest2() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint a\n";
	testProgram += "\tint b\n";
	testProgram += "\tint c\n";
	testProgram += "\ta = 1\n";
	testProgram += "\tb = 1\n";
	testProgram += "\tc = 1\n";
	testProgram += "\twhile(a == 1) {\n";
	testProgram += "\t\tprint(\"loop \")\n";
	testProgram += "\t\tprint(b)\n";
	testProgram += "\t\tif(c == 2) {\n";
	testProgram += "\t\t\ta = 2\n";
	testProgram += "\t\t}\n";
	testProgram += "\t\tif(b == 2) {\n";
	testProgram += "\t\t\tb = 3\n";
	testProgram += "\t\t\tc = 2\n";
	testProgram += "\t\t}\n";
	testProgram += "\t\tif(b == 1) {\n";
	testProgram += "\t\t\tb = 2\n";
	testProgram += "\t\t}\n";
	testProgram += "\t}\n";
	testProgram += "} $";

	return testProgram;

}

function getTest3() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint a\n";
	testProgram += "\t{\n";
	testProgram += "\t\tint a\n";
	testProgram += "\t\ta = 3\n";
	testProgram += "\t\tprint(a)\n";
	testProgram += "\t}\n";
	testProgram += "\t{\n";
	testProgram += "\t\tint a\n";
	testProgram += "\t\ta = 4\n";
	testProgram += "\t\tprint(a)\n";
	testProgram += "\t}\n";
	testProgram += "\t{\n";
	testProgram += "\t\ta = 5\n";
	testProgram += "\t}\n";
	testProgram += "\tprint(a)\n";
	testProgram += "} $";

	return testProgram;

}

function getTest4() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint a\n";
	testProgram += "\t{\n";
	testProgram += "\t\ta = 2\n";
	testProgram += "\t\tint a\n";
	testProgram += "\t\t{\n";
	testProgram += "\t\t\tstring c\n";
	testProgram += "\t\t\t{\n";
	testProgram += "\t\t\t\ta = 5\n";
	testProgram += "\t\t\t\tc = \"hello\"\n";
	testProgram += "\t\t\t}\n";
	testProgram += "\t\t\tprint(c)\n";
	testProgram += "\t\t}\n";
	testProgram += "\t\tprint(a)\n";
	testProgram += "\t}\n";
	testProgram += "\tprint(a)\n";
	testProgram += "} $";

	return testProgram;

}

function getTest5() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint a\n";
	testProgram += "\ta = 6\n";
	testProgram += "\tif(a == 2 + 4) {\n";
	testProgram += "\t\tprint(\"hip hip \")\n";
	testProgram += "\t}\n";
	testProgram += "\tif(5 + 4 == 7 + 2) {\n";
	testProgram += "\t\tprint(\"hooray\")\n";
	testProgram += "\t}\n";
	testProgram += "} $";

	return testProgram;

}

function getTest6() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tboolean a\n";
	testProgram += "\ta = (1 == 2)\n";
	testProgram += "\tboolean b\n";
	testProgram += "\tb = false\n";
	testProgram += "\tif(a == b) {\n";
	testProgram += "\t\tprint(\"meow\")\n";
	testProgram += "\t}\n";
	testProgram += "\tint c\n";
	testProgram += "\tc = 3\n";
	testProgram += "\tc = 1 + 2 + c\n";
	testProgram += "\tprint(c)\n";
	testProgram += "} $";

	return testProgram;

}

function getTest7() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tboolean a\n";
	testProgram += "\ta = (true == (2 == 2))\n";
	testProgram += "\tif(a == true) {\n";
	testProgram += "\t\tprint(\"yay\")\n";
	testProgram += "\t}\n";
	testProgram += "\t{\n";
	testProgram += "\t\tint x\n";
	testProgram += "\t\tint y\n";
	testProgram += "\t\tx = 5\n";
	testProgram += "\t\ty = 6\n";
	testProgram += "\t\tif((x == y) == false) {\n";
	testProgram += "\t\t\tprint(\"hooray\")\n";
	testProgram += "\t\t}\n";
	testProgram += "\t}\n";
	testProgram += "} $";

	return testProgram;

}

function getTest8() {

	var testProgram;

	testProgram  = "{\n";
	testProgram += "\tint i\n";
	testProgram += "\ti = 1\n";
	testProgram += "\twhile((i == 8) == false) {\n";
	testProgram += "\t\tif(i == 1) {\n";
	testProgram += "\t\t\tprint(\"begin \")\n";
	testProgram += "\t\t}\n";
	testProgram += "\t\tprint(\"loop \")\n";
	testProgram += "\t\tprint(i)\n";
	testProgram += "\t\tprint(\" \")\n";
	testProgram += "\t\ti = 1 + i\n";
	testProgram += "\t}\n";
	testProgram += "} $";

	return testProgram;

}