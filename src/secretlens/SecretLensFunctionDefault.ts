import * as interfaces from './interfaces'
import * as crypto from 'crypto'
import * as vscode from 'vscode'

export class SecretLensFunctionDefault implements interfaces.ISecretLensFunction {

    public password: string;

    private rot47(text) {
        var s = [];
        for (var i = 0; i < text.length; i++) {
            var j = text.charCodeAt(i)
            if ((j >= 33) && (j <= 126)) {
                s[i] = String.fromCharCode(33 + ((j + 14) % 94))
            } else {
                s[i] = String.fromCharCode(j)
            }
        }
        return s.join('')
    }

    encrypt(inputText: string): string {
        if (!this.password) {
            vscode.commands.executeCommand('secretlens.setpassword');
        }
        const cipher = crypto.createCipher('aes256', this.password);
        var encrypted = cipher.update(inputText, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    decrypt(inputText: string): string {
        if (!this.password) {
            vscode.commands.executeCommand('secretlens.setpassword');
        }
        const decipher = crypto.createDecipher('aes256', this.password);
        var decrypted = decipher.update(inputText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}