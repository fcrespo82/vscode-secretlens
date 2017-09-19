import * as vscode from 'vscode';
import { SecretLensFunction } from './SecretLensFunction';
import * as interfaces from './interfaces';
/**
 * SecretLensProvider
 */
export class SecretLensProvider implements vscode.CodeLensProvider, vscode.Disposable {

    private disposables: vscode.Disposable[] = []
    private startsWith: string
    private secretLensFunction: SecretLensFunction
    private codeLenses: vscode.CodeLens[]

    constructor() {
        this.startsWith = vscode.workspace.getConfiguration("secretlens").get<string>('startsWith')

        var customSecretFunctionFilePath: any = vscode.workspace.getConfiguration("secretlens").get<any>('customSecretFunctionFilePath')

        this.secretLensFunction = new SecretLensFunction()
    }

    register() {
        var languages: Array<string> = vscode.workspace.getConfiguration("secretlens").get<Array<string>>('languages')

        this.disposables.push(vscode.languages.registerCodeLensProvider(languages, this))

        this.disposables.push(vscode.commands.registerCommand('secretlens.encrypt', this.encrypt, this))

        this.disposables.push(vscode.commands.registerCommand('secretlens.decrypt', this.decrypt, this))

        this.disposables.push(vscode.commands.registerCommand('secretlens.setPassword', this.setPassword, this))

    }

    getFunction(): SecretLensFunction {
        return this.secretLensFunction
    }

    setPassword(): Thenable<void> {
        return this.secretLensFunction.askPassword()
    }

    encrypt(): void {

        var textEditor: vscode.TextEditor = vscode.window.activeTextEditor
        if (!textEditor) {
            return
        }

        this.setPassword().then(() => {
            var edits = new Array()

            textEditor.edit((edits) => {
                textEditor.selections.forEach(selection => {
                    if (selection.isEmpty) {
                        var range = textEditor.document.lineAt(selection.anchor.line).range
                        selection = new vscode.Selection(range.start, range.end)
                    }
                    var text = textEditor.document.getText(selection)

                    if (!text.startsWith(this.startsWith) && text.length > 0) {
                        var encrypted = this.secretLensFunction.encrypt(text)
                        text = this.startsWith + encrypted
                        edits.replace(selection, text)
                    }
                })
            })
        })
    }

    decrypt(): void {
        
        var textEditor: vscode.TextEditor = vscode.window.activeTextEditor
        if (!textEditor) {
            return
        }

        this.setPassword().then(() => {
            var edits = new Array()

            textEditor.edit(edits => {
                textEditor.selections.forEach(selection => {
                    if (selection.isEmpty) {
                        var range = textEditor.document.lineAt(selection.anchor.line).range
                        selection = new vscode.Selection(range.start, range.end)
                    }

                    var text = textEditor.document.getText(selection)

                    if (text.startsWith(this.startsWith)) {
                        text = text.replace(this.startsWith, "")
                        var decrypted = this.secretLensFunction.decrypt(text);
                        edits.replace(selection, decrypted)
                    }
                })
            })
        })

    }

    dispose() {
        if (this.disposables) {
            this.disposables.forEach(item => item.dispose())
            this.disposables = null
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

