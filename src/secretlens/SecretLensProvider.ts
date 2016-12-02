import * as vscode from 'vscode';
import { SecretLensFunctionDefault } from './SecretLensFunctionDefault';
import * as interfaces from './interfaces';
/**
 * SecretLensProvider
 */
export class SecretLensProvider implements vscode.CodeLensProvider, vscode.Disposable {

    private disposables: vscode.Disposable[] = [];
    private startsWith: string;
    private secretLensFunction: interfaces.ISecretLensFunction;
    private codeLenses: vscode.CodeLens[];

    constructor() {
        this.startsWith = vscode.workspace.getConfiguration("secretlens").get<string>('startsWith');

        var secretFunctionFilePath = vscode.workspace.getConfiguration("secretlens").get<string>('secretFunctionFilePath');

        this.secretLensFunction = new SecretLensFunctionDefault();

        if (secretFunctionFilePath) {
            this.secretLensFunction = require(secretFunctionFilePath).instance;
        }

    }

    register() {
        var languages: Array<string> = vscode.workspace.getConfiguration("secretlens").get<Array<string>>('languages');

        this.disposables.push(vscode.languages.registerCodeLensProvider(languages, this));

        this.disposables.push(vscode.commands.registerCommand('secretlens.encrypt', () => {
            this.execute(this.secretLensFunction.encrypt, 'encrypt', this.startsWith)
        }, this));

        this.disposables.push(vscode.commands.registerCommand('secretlens.decrypt', () => {
            this.execute(this.secretLensFunction.decrypt, 'decrypt', this.startsWith)
        }, this));

    }

    private execute(the_function: Function, type: string, startsWith: string): Boolean {

        var editor = vscode.window.activeTextEditor
        if (!editor) {
            return false;
        }

        var selections = editor.selections

        editor.edit((edits) => {
            selections.forEach(selection => {
                var line = editor.document.lineAt(selection.start.line)
                var text = line.text;

                if (type == 'encrypt') {
                    if (!text.startsWith(startsWith)) {
                        text = startsWith + the_function(text)
                    }
                } else {
                    if (text.startsWith(startsWith)) {
                        text = text.replace(startsWith, "");
                        text = the_function(text)
                    }
                }
                edits.replace(line.range, text);

            })
        })
        return true;
    }

    dispose() {
        if (this.disposables) {
            this.disposables.forEach(item => item.dispose());
            this.disposables = null;
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

        this.codeLenses = [];
        mapped.forEach(lineNumber => {
            var line: vscode.TextLine = document.lineAt(lineNumber);
            this.codeLenses.push(new vscode.CodeLens(line.range));
        });
        return this.codeLenses;
    }

    resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {

        var text = vscode.window.activeTextEditor.document.getText(codeLens.range);

        codeLens.command = {
            title: this.startsWith + this.secretLensFunction.decrypt(text.replace(this.startsWith, "")),
            command: 'secretlens.decrypt'
        }

        return codeLens;
    }
}

