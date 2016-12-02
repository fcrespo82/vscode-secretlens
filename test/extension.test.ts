//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import { SecretLensFunctionDefault } from '../src/secretlens';

// Defines a Mocha test suite to group tests of similar kind together
describe("secretlens", () => {
    var cypher;
    before(() => {
        cypher = new SecretLensFunctionDefault();
    });

    context("encrypt", () => {
        it("should encrypt correctly", () => {
            assert.equal(cypher.encrypt('test'), 'E6DE');
        });
    });
    context("decrypt", () => {
        it("should decrypt correctly", () => {
            assert.equal(cypher.decrypt('E6DE'), 'test');

        });
    });
});