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
import { SecretLensProvider } from '../src/secretlens';

// Defines a Mocha test suite to group tests of similar kind together
describe("secretlens", () => {
    var provider: SecretLensProvider
    before(() => {
        provider = new SecretLensProvider();
        
        provider.getFunction().setPassword("test")

    });

    context("encrypt", () => {
        it("should encrypt correctly", () => {
            provider.getFunction().setUseSalt(false)
            var tests = [{
                text:'test',
                encrypted:'cc1fbd73cb93106c3358636ff619bdbd'
            }]
            tests.forEach(test => {
                assert.equal(provider.getFunction().encrypt(test.text), test.encrypted)
            });
        });
    });
    context("decrypt", () => {
        it("should decrypt correctly", () => {
            provider.getFunction().setUseSalt(true)            
            var tests = [
                {
                    text:'test',
                    encrypted:'5ea71fb5236204d32cdb40b90501f7812b545f2e9ed21de69075e0f89fd62855'
                }
            ]
            tests.forEach(test => {
                assert.equal(provider.getFunction().decrypt(test.encrypted), test.text)
            });
        });
    });
});