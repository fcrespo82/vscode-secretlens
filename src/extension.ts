'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {ExtensionContext} from 'vscode';
import {SecretLensProvider} from './secretlens';

var secretLensProvider : SecretLensProvider;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    secretLensProvider = new SecretLensProvider()
    secretLensProvider.register()
}

// this method is called when your extension is deactivated
export function deactivate() {
    secretLensProvider.dispose()
}
