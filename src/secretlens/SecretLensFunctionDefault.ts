import * as interfaces from './interfaces'
import * as crypto from 'crypto'
import * as vscode from 'vscode'

export class SecretLensFunctionDefault implements interfaces.ISecretLensFunction {

    public password: string
    public shouldAskForPassword: boolean
    private saltSize: number = 16

    constructor() {
        this.shouldAskForPassword = true
    }

    encrypt(inputText: string): Thenable<string> {
        return this.setPassword().then((password) => {
            this.password = password;
            var salt = crypto.randomBytes(16).toString('hex')
            const cipher = crypto.createCipher('aes256', salt + this.password);
            var encrypted = cipher.update(inputText, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return salt + encrypted;
        });
    }

    decrypt(inputText: string): Thenable<string> | string {
        var salt = inputText.substring(0, 16 * 2)
        inputText = inputText.replace(salt, "")
        if (this.password === undefined || this.password === null || this.password === "") {
            return this.setPassword().then((password) => {
                this.password = password;
                const decipher = crypto.createDecipher('aes256', salt + this.password);
                var decrypted = decipher.update(inputText, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                return decrypted;
            });
        } else {
            const decipher = crypto.createDecipher('aes256', salt + this.password);
            var decrypted = decipher.update(inputText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
    }

    setPassword(): Thenable<string> {
        if (this.shouldAskForPassword && (this.password === undefined || this.password === null || this.password === "")) {
            var self = this;
            return vscode.window.showInputBox({
                password: true, prompt: "What's the password to encrypt/decrypt this message?", placeHolder: "password", ignoreFocusOut: true,
                validateInput: this.validatePassword
            }).then(function(password) {
                return password
            });
        } else {
            return Promise.resolve(this.password)
        }
    }

    private validatePassword(password: string): string {
        if (password === undefined || password === null || password === "") {
            return "You should provide a password";
        }
        if (password.length <= 4) {
            return "The password should have at least 5 characters";
        }
        return undefined
    }
}