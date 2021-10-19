//import clipboard from 'clipboardy';
import { lstat, lstatSync, readdir, readFile, writeFile } from 'fs';
import { join } from 'path';
import * as vscode from 'vscode';
import { SecretLensFunction } from './SecretLensFunction';
/**
 * SecretLensProvider
 */
export class SecretLensProvider implements vscode.CodeLensProvider, vscode.Disposable, vscode.HoverProvider {

	private regex: RegExp;
	private disposables: vscode.Disposable[] = [];
	private secretLensFunction: SecretLensFunction;
	private codeLenses: vscode.CodeLens[];
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
	private config: vscode.WorkspaceConfiguration;

	constructor() {
		this.configLoaded();
		this.secretLensFunction = new SecretLensFunction(this);
	}

	reload() {
		this._onDidChangeCodeLenses.fire();
	}

	private configLoaded() {
		this.config = vscode.workspace.getConfiguration("secretlens");
		if (this.config.get<boolean>("excludeEnd")) {
			this.regex = new RegExp(`${this.escapeToken(this.startToken)}.+(${this.escapeToken(this.endToken)})?`, "g");
		} else {
			this.regex = new RegExp(`${this.escapeToken(this.startToken)}.+${this.escapeToken(this.endToken)}`, "g");
		}

		this.forgetPassword(true);
	}

	private escapeToken(token) {
		let regexReservedCharacters = ["(", ")", "[", "]"];
		if (regexReservedCharacters.indexOf(token) >= 0) {
			return `\\${token}`;
		}
		return token;
	}
	private get startToken(): string {
		return this.config.get('token');
	}

	private get endToken(): string {
		if (this.config.get("endToken")) {
			return this.config.get('endToken');
		}
		return this.config.get('token');
	}

	private removeTokens(text: string): string {
		return text.replace(this.startToken, "").replace(this.endToken, "");
	}

	public register(): Promise<boolean> {
		try {
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

			this.disposables.push(vscode.commands.registerCommand('secretlens.encrypt', this.encrypt, this));
			this.disposables.push(vscode.commands.registerCommand('secretlens.encryptFile', this.encryptFile, this));
			this.disposables.push(vscode.commands.registerCommand('secretlens.encryptDir', this.encryptDir, this));
			this.disposables.push(vscode.commands.registerCommand('secretlens.decrypt', this.decrypt, this));
			this.disposables.push(vscode.commands.registerCommand('secretlens.decryptFile', this.decryptFile, this));
			this.disposables.push(vscode.commands.registerCommand('secretlens.decryptDir', this.decryptDir, this));
			this.disposables.push(vscode.commands.registerCommand('secretlens.setPassword', this.setPassword, this));
			this.disposables.push(vscode.commands.registerCommand('secretlens.forgetPassword', this.forgetPassword, this));
			this.disposables.push(vscode.commands.registerTextEditorCommand('secretlens.copySecret', this.copySecret, this));

			vscode.workspace.onDidChangeConfiguration((event) => {
				this.configLoaded();
			});
			return Promise.resolve(true);
		} catch (error) {
			return Promise.reject(false);
		}
	}

	private copySecret(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
		this.askPassword().then(() => {
			let decrypted = [];
			editor.selections.forEach(selection => {
				for (let i = selection.start.line; i <= selection.end.line; i++) {
					let line = vscode.window.activeTextEditor.document.lineAt(i);
					const regex = new RegExp(this.regex);
					let text = line.text;
					let match;
					while ((match = regex.exec(text)) !== null) {
						let text = this.removeTokens(match[0]);
						decrypted.push(this.secretLensFunction.decrypt(text));
					}
				}
			});
			if (decrypted.length > 0) {
				let copySeparator: string = this.config.get("copySeparator");
				vscode.env.clipboard.writeText(decrypted.join(copySeparator));
				vscode.window.showInformationMessage('Secrets copied to clipboard.')
			}
		});
	}

	public getFunction(): SecretLensFunction {
		return this.secretLensFunction;
	}

	private setPassword(): Thenable<void> {
		return this.secretLensFunction.askPassword().then(() => {
			this.forgetPassword(true);
			return Promise.resolve();
		});
	}

	private forgetPassword(wait = null) {
		let rememberPeriod: Number = this.config.get("rememberPeriod");
		if (!wait) {
			this.secretLensFunction.forgetPassword();
		} else if (wait && rememberPeriod >= 0) {
			let forgetInMilliseconds = rememberPeriod.valueOf() * 1000;
			setTimeout(() => {
				this.secretLensFunction.forgetPassword();
			}, forgetInMilliseconds);
		}
	}

	private askPassword(): Thenable<void> {
		if (this.secretLensFunction.shouldAskForPassword) {
			return this.setPassword();
		}
		return Promise.resolve();
	}

	private encryptFile(uri: vscode.Uri): void {
		this.askPassword().then(() => {
			readFile(uri.fsPath, (err, data) => {
				if (err) { throw err; }
				const originalText = data.toString();
				const encrypted = this.secretLensFunction.encrypt(data.toString(), this.config.get("cryptoMethod"));
				const text = this.startToken + encrypted + (!this.config.get("excludeEnd") ? this.endToken : "");
				const regex = new RegExp(this.regex);
				if (!regex.test(data.toString())) {
					writeFile(uri.fsPath, text, (err) => {
						if (err) { throw err; }
					});
				}
			});
		});
	}

	private encryptDir(uri: vscode.Uri): void {
		this.askPassword().then(() => {
			lstat(uri.fsPath, (err, stats) => {
				if (err) { throw err; }
				if (stats.isDirectory()) {
					readdir(uri.fsPath, (err, files) => {
						if (err) { throw err; }
						files.forEach(file => {
							const fullPath = join(uri.fsPath, file);
							if (this.config.get("recursiveDirectories") && lstatSync(fullPath).isDirectory()) {
								this.encryptDir(vscode.Uri.file(fullPath));
							} else {
								this.encryptFile(vscode.Uri.file(fullPath));
							}
						});
					});
				}
			});
		});
	}

	private decryptFile(uri: vscode.Uri): void {
		this.askPassword().then(() => {
			const regex = new RegExp(this.regex);
			readFile(uri.fsPath, (err, data) => {
				if (err) { throw err; }
				if (regex.test(data.toString())) {
					let text = this.removeTokens(data.toString());
					const textDecrypted = this.secretLensFunction.decrypt(text);
					writeFile(uri.fsPath, textDecrypted, (err) => {
						if (err) { throw err; }
					});
				} else {
					console.log("This file was not encrypted with SecretLens");
				}
			});
		});
	}

	private decryptDir(uri: vscode.Uri): void {
		this.askPassword().then(() => {
			lstat(uri.fsPath, (err, stats) => {
				if (err) { throw err; }
				if (stats.isDirectory()) {
					readdir(uri.fsPath, (err, files) => {
						if (err) { throw err; }
						files.forEach(file => {
							const fullPath = join(uri.fsPath, file);
							if (this.config.get("recursiveDirectories") && lstatSync(fullPath).isDirectory()) {
								this.decryptDir(vscode.Uri.file(fullPath));
							} else {
								this.decryptFile(vscode.Uri.file(fullPath));
							}
						});
					});
				}
			});
		});
	}

	private encrypt(): void {
		let replaces = [];
		this.askPassword().then(() => {
			let editor = vscode.window.activeTextEditor;
			editor.edit((edits) => {
				editor.selections.forEach(selection => {
					var range = new vscode.Range(selection.start, selection.end);
					if (selection.isEmpty) {
						range = editor.document.lineAt(selection.start.line).range;
					}
					var text = editor.document.getText(range);
					const regex = new RegExp(this.regex);
					if (!regex.test(text) && text.length > 0) {
						var encrypted = this.secretLensFunction.encrypt(text, this.config.get("cryptoMethod"));
						text = this.startToken + encrypted + (!this.config.get("excludeEnd") ? this.endToken : "");
						edits.replace(range, text);
						replaces.push(new vscode.Selection(range.start, range.start.translate(0, text.length)));
					}
				});
			}).then(() => {
				editor.selections = replaces;
			});
		});
	}

	private decrypt(): void {
		let replaces = [];
		this.askPassword().then(() => {
			let editor = vscode.window.activeTextEditor;
			editor.edit(edits => {
				editor.selections.forEach(selection => {
					let line = editor.document.lineAt(selection.start.line);
					const regex = new RegExp(this.regex);
					let text = line.text;
					let match;
					while ((match = regex.exec(text)) !== null) {
						let text = this.removeTokens(match[0]);
						let index = line.text.indexOf(match[0]);
						let position = new vscode.Position(line.lineNumber, index);
						let range = editor.document.getWordRangeAtPosition(position, new RegExp(this.regex));

						edits.replace(range, this.secretLensFunction.decrypt(text));
						replaces.push(new vscode.Selection(range.start, range.start.translate(0, this.secretLensFunction.decrypt(text).length)));
					}
				});
			}).then(() => {
				editor.selections = replaces;
			});
		});
	}

	public dispose() {
		if (this.disposables) {
			this.disposables.forEach(item => item.dispose());
			this.disposables = null;
		}
	}

	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
		this.codeLenses = [];
		const regex = new RegExp(this.regex);
		const text = document.getText();
		let matches;
		while ((matches = regex.exec(text)) !== null) {
			let line = document.lineAt(document.positionAt(matches.index).line);
			let indexOf = line.text.indexOf(matches[0]);
			let position = new vscode.Position(line.lineNumber, indexOf);
			let range = document.getWordRangeAtPosition(position, new RegExp(this.regex));
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
			};
		} else {
			let decrypted: string;
			try {
				decrypted = this.secretLensFunction.decrypt(this.removeTokens(text));
				codeLens.command = {
					title: decrypted,
					command: 'secretlens.copySecret'
				};
			} catch (error) {
				codeLens.command = {
					title: 'Failed to decrypt the message (the password is correct?)',
					command: 'secretlens.setPassword'
				};
			}
		}
		return codeLens;
	}

	provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
		let line = document.lineAt(position);
		let text = this.secretLensFunction.decrypt(this.removeTokens(line.text));
		return new vscode.Hover(text, line.range);
	}
}

