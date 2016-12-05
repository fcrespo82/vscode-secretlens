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

        this.disposables.push(vscode.commands.registerTextEditorCommand('secretlens.encrypt', this.execute, this));

        this.disposables.push(vscode.commands.registerTextEditorCommand('secretlens.decrypt', this.execute, this));

    }

    execute(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {

        if (!textEditor) {
            return false;
        }

        textEditor.selections.forEach(selection => {
            if (!selection.isSingleLine){
                vscode.window.showWarningMessage("The extension can only be executed in single line selections")
                return false
            }

            var line = textEditor.document.lineAt(selection.start.line)
            var text = line.text;

            if (text.startsWith(this.startsWith)) {
                text = text.replace(this.startsWith, "")
                text = this.secretLensFunction.decrypt(text)
                edit.replace(line.range, text);
            } else if (!text.startsWith(this.startsWith) && text.length > 0) {
                text = this.startsWith + this.secretLensFunction.encrypt(text)
                edit.replace(line.range, text);
            }
        });

        return true
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
        })

        mapped = mapped.filter(element => {
            if (element != undefined && element >= 0) {
                return element + 1
            }
        })

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

