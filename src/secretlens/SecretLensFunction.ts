import * as interfaces from './interfaces'
import * as crypto from 'crypto'
import * as vscode from 'vscode'

export class SecretLensFunction implements interfaces.ISecretLensFunction {

    public password: string
    public shouldAskForPassword: boolean
    private saltSize: number = 16

    constructor() {
        this.shouldAskForPassword = true
    }

    encrypt(inputText: string): string {
            var salt = crypto.randomBytes(this.saltSize).toString('hex')
            const cipher = crypto.createCipher('aes256', salt + this.password);
            var encrypted = cipher.update(inputText, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return salt + encrypted;
    }

    decrypt(inputText: string): string {
        var salt = inputText.substring(0, this.saltSize * 2)
        inputText = inputText.replace(salt, "")
        const decipher = crypto.createDecipher('aes256', salt + this.password);
        var decrypted = decipher.update(inputText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
        
    }

    setPassword(): Thenable<string> {
        if (this.shouldAskForPassword && (this.password === undefined || this.password === null || this.password === "")) {
            var self = this;
            return vscode.window.showInputBox({
                password: true, prompt: "What's the password to encrypt/decrypt this message?", placeHolder: "password", ignoreFocusOut: true,
                validateInput: this.validatePassword
            }).then(function(password) {
                return password
            })
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