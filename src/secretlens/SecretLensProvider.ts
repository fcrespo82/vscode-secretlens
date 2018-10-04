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
    private config = vscode.workspace.getConfiguration("secretlens")

    constructor() {
        this.startsWith = this.config.get('startsWith')
        this.secretLensFunction = new SecretLensFunction(this)
    }

    reload() {
        this._onDidChangeCodeLenses.fire()
    }

    public register() {
        var languages: string[] = this.config.get('languages');

        switch (this.config.get<string>('displayType').toUpperCase()) {
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
        this.disposables.push(vscode.commands.registerCommand('secretlens.forgetPassword', this.forgetPassword, this))
        this.disposables.push(vscode.commands.registerTextEditorCommand('secretlens.copySecret', this.copySecret, this))

        vscode.workspace.onDidChangeConfiguration((event) => {
            this.config = vscode.workspace.getConfiguration("secretlens")
            this.forgetPassword(true)
        })
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
            let copySeparator: string = this.config.get("copySeparator")
            clipboardy.write(decrypted.join(copySeparator))
        });
    }

    public getFunction(): SecretLensFunction {
        return this.secretLensFunction
    }

    private setPassword(): Thenable<void> {
        return this.secretLensFunction.askPassword().then(() => {
            this.forgetPassword(true)
            return Promise.resolve()
        })
    }

    private forgetPassword(wait = null) {
        let forgetPeriod: Number = this.config.get("forgetPeriod")
        if (!wait) {
            this.secretLensFunction.forgetPassword()
        } else if (wait && forgetPeriod >= 0) {
            let forgetInMilliseconds = forgetPeriod.valueOf() * 1000
            setTimeout(() => {
                this.secretLensFunction.forgetPassword()
            }, forgetInMilliseconds)
        }
    }

    private askPassword(): Thenable<void> {
        if (this.secretLensFunction.shouldAskForPassword) {
            return this.setPassword()
        }
        return Promise.resolve()
    }

    private encrypt(): void {
        let replaces = []
        this.askPassword().then(() => {
            let editor = vscode.window.activeTextEditor
            editor.edit((edits) => {
                editor.selections.forEach(selection => {
                    let mySel = selection
                    var range = new vscode.Range(selection.start, selection.end);
                    if (mySel.isEmpty) {
                        range = editor.document.lineAt(mySel.start.line).range
                    }
                    var text = editor.document.getText(range)

                    if (!text.startsWith(this.startsWith) && text.length > 0) {
                        var encrypted = this.secretLensFunction.encrypt(text)
                        var text = this.startsWith + encrypted
                        edits.replace(range, text)
                        replaces.push(new vscode.Selection(range.start, range.start.translate(0, text.length)))
                    }
                })
            }).then(() => {
                console.log(replaces)
                editor.selections = replaces
            })
        })
    }

    private decrypt(): void {
        let replaces = []
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

                        replaces.push(new vscode.Selection(range.start, range.start.translate(0, this.secretLensFunction.decrypt(text).length)))
                    }
                })
            }).then(() => {
                console.log(replaces)
                editor.selections = replaces
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

