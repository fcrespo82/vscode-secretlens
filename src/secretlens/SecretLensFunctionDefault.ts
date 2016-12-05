import * as interfaces from './interfaces'
import * as crypto from 'crypto'
import * as vscode from 'vscode'

export class SecretLensFunctionDefault implements interfaces.ISecretLensFunction {

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
        vscode.window.showInputBox({ password: true, prompt: "Password", placeHolder: "password" }).then(function (password) {
            const cipher = crypto.createCipher('aes256', password);
            var encrypted = cipher.update('some clear text data', 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return encrypted;
        })
        
    }

    decrypt(inputText: string): string {
        vscode.window.showInputBox({ password: true, prompt: "Password", placeHolder: "password" }).then(function (password) {
            const decipher = crypto.createDecipher('aes256', password);
            var decrypted = decipher.update(inputText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        });
    }
}