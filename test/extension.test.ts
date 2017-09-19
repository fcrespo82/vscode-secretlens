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
import { SecretLensFunction, ISecretLensFunction } from '../src/secretlens';

// Defines a Mocha test suite to group tests of similar kind together
describe("secretlens", () => {
    var cypher: ISecretLensFunction;
    before(() => {
        cypher = new SecretLensFunction();
        cypher.shouldAskForPassword = false
        cypher.password = "teste"
    });

    context("encrypt", () => {
        it("should encrypt correctly", () => {
            assert.equal(cypher.encrypt('test'), '46800f525d58bb6a3886d37a247bd4db');
        });
    });
    context("decrypt", () => {
        it("should decrypt correctly", () => {
            assert.equal(cypher.decrypt('46800f525d58bb6a3886d37a247bd4db'), 'test');

        });
    });
});