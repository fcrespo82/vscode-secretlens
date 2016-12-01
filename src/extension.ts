'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SecretLensHandler } from './SecretLensHandler';
import { ISecretLensFunction, SecretFunctionDefault } from './SecretLensFunction';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    var languages: Array<string> = vscode.workspace.getConfiguration("secretlens").get<Array<string>>('languages');

    var disposableLenses = vscode.languages.registerCodeLensProvider(languages, new SecretLensHandler());
    context.subscriptions.push(disposableLenses);

    // var configListener = vscode.workspace.onDidChangeConfiguration(null, this, context.subscriptions);

    this.secretFunctionFilePath = vscode.workspace.getConfiguration("secretlens").get<string>('secretFunctionFilePath');

    if (this.secretFunctionFilePath) {
        this.secretFunction = require(this.secretFunctionFilePath).instance;
    } else {
        this.secretFunction = new SecretFunctionDefault();
    }

    var encode = vscode.commands.registerCommand('secretlens.encode', () => {
        return execute(this.secretFunction.encode)
    });
    var decode = vscode.commands.registerCommand('secretlens.decode', () => {
        return execute(this.secretFunction.decode)
    });

    context.subscriptions.push(encode);
    context.subscriptions.push(decode);

}

// this method is called when your extension is deactivated
export function deactivate() {

}

function execute(the_function: Function): any {
    var startsWith = vscode.workspace.getConfiguration("secretlens").get<string>('startsWith');

    var editor = vscode.window.activeTextEditor
    if (!editor) {
        return false;
    }

    var selections = editor.selections

    editor.edit((edits) => {
        selections.forEach(selection => {
            var text = editor.document.getText(selection);
            edits.replace(selection, the_function(text));
        })
    })
    return true;
}