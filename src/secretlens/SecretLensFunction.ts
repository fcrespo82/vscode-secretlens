import * as interfaces from './interfaces'
import * as crypto from 'crypto'
import * as vscode from 'vscode'
import { SecretLensProvider } from './SecretLensProvider';

export class SecretLensFunction implements interfaces.ISecretLensFunction {
    private password: string
    public shouldAskForPassword: boolean = true
    private saltSize: number = 16
    private useSalt: boolean = true

    private provider
    constructor(provider: SecretLensProvider) {
        this.provider = provider
    }

    public encrypt(inputText: string): string {
        var encrypted: string = ""
        var saltedPassword = this.password
        if (this.useSalt) {
            var salt = crypto.randomBytes(this.saltSize).toString('hex')
            saltedPassword = salt + this.password
        }
        const cipher = crypto.createCipher('aes256', saltedPassword)
        encrypted = cipher.update(inputText, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        if (this.useSalt) {
            return salt + encrypted
        } else {
            return encrypted
        }
    }

    public decrypt(inputText: string): string {
        var decrypted: string = ""
        var ended = false
        var saltedPassword = this.password
        if (this.useSalt) {
            var salt = inputText.substring(0, this.saltSize * 2)
            inputText = inputText.replace(salt, "")
            saltedPassword = salt + this.password
        }
        const decipher = crypto.createDecipher('aes256', saltedPassword)
        decrypted = decipher.update(inputText, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        ended = true
        return decrypted
    }

    public setUseSalt(useSalt: boolean) {
        this.useSalt = useSalt
    }

    public setPassword(password: string): void {
        this.password = password
        this.shouldAskForPassword = false
        this.provider.reload()
    }

    public forgetPassword(): void {
        this.password = null
        this.shouldAskForPassword = true
        this.provider.reload()
    }

    public askPassword(): Thenable<void> {
        var self = this;
        return vscode.window.showInputBox({
            password: true, prompt: "What's the password to encrypt/decrypt this message?", placeHolder: "password", ignoreFocusOut: true,
            validateInput: this.validatePassword
        }).then(function (password) {
            if (password) {
                self.setPassword(password)
                return Promise.resolve()
            }
            return Promise.reject()
        })
    }

    private validatePassword(password: string): string {
        if (password === undefined || password === null || password === "") {
            return "You must provide a password";
        }
        if (password.length <= 4) {
            return "The password must have at least 5 characters";
        }
        return undefined
    }
}