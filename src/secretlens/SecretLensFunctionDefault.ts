import * as interfaces from './interfaces'
import * as crypto from 'crypto'
import * as vscode from 'vscode'

export class SecretLensFunctionDefault implements interfaces.ISecretLensFunction {

    public password: string;
    public shouldAskForPassword: boolean;

    constructor() {
        this.shouldAskForPassword = true;
    }

    encrypt(inputText: string): Thenable<string> {
        return this.setPassword().then(() => {
            const cipher = crypto.createCipher('aes256', this.password);
            var encrypted = cipher.update(inputText, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return encrypted;
        });
    }

    decrypt(inputText: string): Thenable<string> | string {
        if (this.password == "") {
            return this.setPassword().then(() => {
                const decipher = crypto.createDecipher('aes256', this.password);
                var decrypted = decipher.update(inputText, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                return decrypted;
            });
        } else {
            const decipher = crypto.createDecipher('aes256', this.password);
            var decrypted = decipher.update(inputText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
    }

    setPassword(): Thenable<void> {
        if (this.shouldAskForPassword && this.password === undefined) {
            var self = this;
            return vscode.window.showInputBox({ password: true, prompt: "What's the password to encrypt/decrypt this message?", placeHolder: "password" }).then(function (password) {
                self.password = password;
            });
        } else {
            return Promise.resolve()
        }
    }
}