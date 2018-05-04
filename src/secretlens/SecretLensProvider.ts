import { SecretLensFunction } from './SecretLensFunction';
import * as interfaces from './interfaces';
import * as clipboardy from 'clipboardy'
import * as vscode from 'vscode';
/**
 * SecretLensProvider
 */
export class SecretLensProvider implements vscode.CodeLensProvider, vscode.Disposable, vscode.HoverProvider {

    private disposables: vscode.Disposable[] = []
    private startsWith: string
    private secretLensFunction: SecretLensFunction
    private codeLenses: vscode.CodeLens[]

    constructor() {
        this.startsWith = vscode.workspace.getConfiguration('secretlens').get<string>('startsWith')
        var customSecretFunctionFilePath: any = vscode.workspace.getConfiguration('secretlens').get<any>('customSecretFunctionFilePath')
        this.secretLensFunction = new SecretLensFunction()
    }

    public register() {
        const config = vscode.workspace.getConfiguration('secretlens');
        var languages: Array<string> = config.get<Array<string>>('languages');

        switch (config.get<string>('displayType').toUpperCase()) {
            case 'HOVER':
                this.disposables.push(vscode.languages.registerHoverProvider(languages, this));
                break;
            case 'BOTH':
                this.disposables.push(vscode.languages.registerHoverProvider(languages, this));
                this.disposables.push(vscode.languages.registerCodeLensProvider(languages, this));
                break;
            default:
                this.disposables.push(vscode.languages.registerCodeLensProvider(languages, this));
                break;
        }

        this.disposables.push(vscode.commands.registerCommand('secretlens.encrypt', this.encrypt, this))
        this.disposables.push(vscode.commands.registerCommand('secretlens.decrypt', this.decrypt, this))
        this.disposables.push(vscode.commands.registerCommand('secretlens.setPassword', this.setPassword, this))
        this.disposables.push(vscode.commands.registerTextEditorCommand('secretlens.copySecret', this.copySecret, this))
    }

    private copySecret(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
        this.setPassword().then(() => {
            let line = vscode.window.activeTextEditor.document.lineAt(editor.selection.start.line)
            if (line.text.startsWith(this.startsWith)) {
                if (editor.selections.length > 1) {
                    vscode.window.showErrorMessage('Can only copy one secret')
                } else {
                    var text = line.text.replace(this.startsWith, '')
                    var decrypted = this.secretLensFunction.decrypt(text);
                    clipboardy.write(decrypted);
                }
            }
        });
    }

    public getFunction(): SecretLensFunction {
        return this.secretLensFunction
    }

    private setPassword(): Thenable<void> {
        return this.secretLensFunction.askPassword()
    }

    private encrypt(): void {
        this.setPassword().then(() => {
            vscode.window.activeTextEditor.edit((edits) => {
                vscode.window.activeTextEditor.selections.forEach(selection => {
                    let mySel = selection
                    var range = new vscode.Range(selection.start, selection.end);
                    if (mySel.isEmpty) {
                        range = vscode.window.activeTextEditor.document.lineAt(mySel.start.line).range
                    }
                    var text = vscode.window.activeTextEditor.document.getText(range)

                    if (!text.startsWith(this.startsWith) && text.length > 0) {
                        var encrypted = this.secretLensFunction.encrypt(text)
                        var text = this.startsWith + encrypted
                        edits.replace(range, text)
                    }
                })
            });
        })
    }

    private decrypt(): void {
        this.setPassword().then(() => {
            vscode.window.activeTextEditor.edit(edits => {
                vscode.window.activeTextEditor.selections.forEach(selection => {
                    let line = vscode.window.activeTextEditor.document.lineAt(selection.start.line)
                    let fullLineRange = line.range
                    if (line.text.startsWith(this.startsWith)) {
                        var text = line.text.replace(this.startsWith, '')
                        var decrypted = this.secretLensFunction.decrypt(text);
                        edits.replace(fullLineRange, decrypted)
                    }
                })
            })
        })
    }

    public dispose() {
        if (this.disposables) {
            this.disposables.forEach(item => item.dispose())
            this.disposables = null
        }
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        this.codeLenses = [];
        const regex = new RegExp(this.startsWith, 'g');
        const text = document.getText();
        var matches;
        while ((matches = regex.exec(text)) !== null) {
            let start = document.positionAt(matches.index);
            let line = document.lineAt(document.positionAt(matches.index).line);
            let command = {
                title: this.secretLensFunction.decrypt(line.text.replace(this.startsWith, '')),
                command: 'secretlens.copySecret'
            }
            this.codeLenses.push(new vscode.CodeLens(line.range, command));
        }
        return this.codeLenses;
    }

    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        let line = document.lineAt(position);
        let text = this.secretLensFunction.decrypt(line.text.replace(this.startsWith, ''));
        return new vscode.Hover(text, line.range)
    }
}

