import { SecretLensFunction } from './SecretLensFunction';
import * as interfaces from './interfaces';
import * as copyPaste from "copy-paste"
import * as vscode from "vscode";
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

        this.disposables.push(vscode.commands.registerTextEditorCommand('secretlens.copySecret', this.copySecret, this))

    }

    copySecret(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
        let selection = editor.selection
        var range = new vscode.Range(selection.start, selection.end);
        if (selection.isEmpty) {
             range = editor.document.lineAt(selection.anchor.line).range
        }
        var text = editor.document.getText(range)
        if (text.startsWith(this.startsWith)) {
            if (editor.selections.length > 1) {
                vscode.window.showErrorMessage("Can only copy one secret")
            } else {
                text = text.replace(this.startsWith, "")
                var decrypted = this.secretLensFunction.decrypt(text);
                copyPaste.copy(decrypted, (e) => {
                    console.log(e);
                });
            }

        }
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
            textEditor.edit((edits) => {
                textEditor.selections.forEach(selection => {
                    let mySel = selection
                    var range = new vscode.Range(selection.start, selection.end);
                    if (mySel.isEmpty) {
                        range = textEditor.document.lineAt(mySel.start.line).range
                    }
                    var text = textEditor.document.getText(range)

                    if (!text.startsWith(this.startsWith) && text.length > 0) {
                        var encrypted = this.secretLensFunction.encrypt(text)
                        text = this.startsWith + encrypted
                        edits.replace(range, text)
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
            textEditor.edit(edits => {
                textEditor.selections.forEach(selection => {
                    let mySel = selection
                    var range = new vscode.Range(selection.start, selection.end);
                    if (mySel.isEmpty) {
                        range = textEditor.document.lineAt(mySel.start.line).range
                    }
                    var text = textEditor.document.getText(range)

                    if (text.startsWith(this.startsWith)) {
                        text = text.replace(this.startsWith, "")
                        var decrypted = this.secretLensFunction.decrypt(text);
                        edits.replace(range, decrypted)
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

