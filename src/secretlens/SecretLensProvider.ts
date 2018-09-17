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
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>()
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event

    constructor() {
        this.startsWith = vscode.workspace.getConfiguration("secretlens").get<string>('startsWith')
        this.secretLensFunction = new SecretLensFunction(this)
    }

    reload() {
        this._onDidChangeCodeLenses.fire()
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
        this.askPassword().then(() => {
            let decrypted = []
            editor.selections.forEach(selection => {
                let line = vscode.window.activeTextEditor.document.lineAt(selection.start.line)
                const regex = new RegExp(this.startsWith + '.{64,}?\\b', 'g')
                let text = line.text
                let match;
                while ((match = regex.exec(text)) !== null) {
                    let text = match[0].replace(this.startsWith, '')
                    decrypted.push(this.secretLensFunction.decrypt(text))
                }
            });
            const config = vscode.workspace.getConfiguration('secretlens');
            let copySeparator = config.get<string>("copySeparator")
            clipboardy.write(decrypted.join(copySeparator))

        });
    }

    public getFunction(): SecretLensFunction {
        return this.secretLensFunction
    }

    private setPassword(): Thenable<void> {
        return this.secretLensFunction.askPassword()
    }

    private askPassword(): Thenable<void> {
        if (this.secretLensFunction.shouldAskForPassword) {
            return this.secretLensFunction.askPassword()
        }
        return Promise.resolve()
    }

    private encrypt(): void {
        this.askPassword().then(() => {
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
        this.askPassword().then(() => {
            let editor = vscode.window.activeTextEditor
            editor.edit(edits => {
                editor.selections.forEach(selection => {
                    let line = editor.document.lineAt(selection.start.line)

                    const regex = new RegExp(this.startsWith + '.{64,}?\\b', 'g')
                    let text = line.text
                    let match;
                    while ((match = regex.exec(text)) !== null) {
                        let text = match[0].replace(this.startsWith, '')
                        let index = line.text.indexOf(match[0])
                        let position = new vscode.Position(line.lineNumber, index)
                        let range = editor.document.getWordRangeAtPosition(position, new RegExp(this.startsWith + '.{64,}?\\b', 'g'))
                        edits.replace(range, this.secretLensFunction.decrypt(text))
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
        // Need at least 64 chars after `startswith` string to act as a SecretLens
        const regex = new RegExp(this.startsWith + '.{64,}?\\b', 'g')
        const text = document.getText()
        let matches;
        while ((matches = regex.exec(text)) !== null) {
            let line = document.lineAt(document.positionAt(matches.index).line);
            let indexOf = line.text.indexOf(matches[0])
            let position = new vscode.Position(line.lineNumber, indexOf)
            let range = document.getWordRangeAtPosition(position, new RegExp(this.startsWith + '.{64,}?\\b', 'g'))
            this.codeLenses.push(new vscode.CodeLens(range));
        }
        return this.codeLenses;
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        var text = vscode.window.activeTextEditor.document.getText(codeLens.range);

        if (this.secretLensFunction.shouldAskForPassword) {
            codeLens.command = {
                title: "Password not set: click here to set",
                command: 'secretlens.setPassword'
            }
        } else {
            let decrypted: string
            try {
                decrypted = this.secretLensFunction.decrypt(text.replace(this.startsWith, ""))
                codeLens.command = {
                    title: decrypted,
                    command: 'secretlens.copySecret'
                }
            } catch (error) {
                codeLens.command = {
                    title: 'Failed to decrypt the message (the password is correct?)',
                    command: 'secretlens.setPassword'
                }
            }
        }
        return codeLens;
    }

    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        let line = document.lineAt(position);
        let text = this.secretLensFunction.decrypt(line.text.replace(this.startsWith, ''));
        return new vscode.Hover(text, line.range)
    }
}

