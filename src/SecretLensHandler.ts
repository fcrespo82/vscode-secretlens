import * as vscode from 'vscode';
import { ISecretLensFunction, SecretFunctionDefault } from './SecretLensFunction';
/**
 * SecretLensHandler
 */
export class SecretLensHandler implements vscode.CodeLensProvider {
    startsWith: string;
    secretFunctionFilePath: string;
    secretFunction: ISecretLensFunction;

    constructor() {
        this.startsWith = vscode.workspace.getConfiguration("secretlens").get<string>('startsWith');
        this.secretFunctionFilePath = vscode.workspace.getConfiguration("secretlens").get<string>('secretFunctionFilePath');

        if (this.secretFunctionFilePath) {
            this.secretFunction = require(this.secretFunctionFilePath).instance;
        } else {
            this.secretFunction = new SecretFunctionDefault();
        }

    }

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

        var lines: string[] = document.getText().split("\n");
        var mapped: number[] = [];

        mapped = lines.map((line, index) => {
            if (line.startsWith(this.startsWith)) {
                return index;
            }
        }).filter(element => { return element })

        var codeLenses: vscode.CodeLens[] = [];
        mapped.forEach(lineNumber => {
            var linha: vscode.TextLine = document.lineAt(lineNumber);
            codeLenses.push({
                range: linha.range,
                command: {
                    title: this.startsWith + " " + this.secretFunction.decode(linha.text.substr(this.startsWith.length)), command: 'decode'
                },
                isResolved: true
            });
        });
        return codeLenses;
    }
    resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        return codeLens;
    }
}

