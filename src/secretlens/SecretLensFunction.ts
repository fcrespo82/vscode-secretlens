import * as interfaces from './interfaces';
import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { SecretLensProvider } from './SecretLensProvider';

export class SecretLensFunction implements interfaces.ISecretLensFunction {
    private password: string;
    public shouldAskForPassword: boolean = true;
    private saltSize: number = 16;
    private useSalt: boolean = true;

    private provider;
    constructor(provider: SecretLensProvider) {
        this.provider = provider;
    }

    public encrypt(inputText: string, cryptoMethod: string): string {

        if (cryptoMethod == "pbkdf2") {

            // Equivalent shell command: openssl enc -aes-256-cbc -pbkdf2 | xxd -p | tr -d "\n"
            //
            var binsalt;
            if (this.useSalt) {
                binsalt = crypto.randomBytes(8);
            } else {
                binsalt = Buffer.alloc(8);
            }
            let derivedKey = crypto.pbkdf2Sync(this.password, binsalt, 10000, 48, 'sha256');
            let key = derivedKey.slice(0, 32);
            let iv = derivedKey.slice(32, 48);

            let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
            var encrypted = cipher.update(inputText, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return 'pbkdf2:53616c7465645f5f' + binsalt.toString('hex') + encrypted;
            // '53616c7465645f5f' is hexa for string "Salted__".
            // This is added for compatibility with the openssl command.
            // Specifically, with openssl salt generation algorithm, the first 8 bytes
            // are always "Salted__" and the last 8 bytes are random.
        } else {
            var encrypted: string = "";
            var saltedPassword = this.password;
            if (this.useSalt) {
                var salt = crypto.randomBytes(this.saltSize).toString('hex');
                saltedPassword = salt + this.password;
            }
            const cipher = crypto.createCipher('aes-256-cbc', saltedPassword);
            encrypted = cipher.update(inputText, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            if (this.useSalt) {
                return salt + encrypted;
            } else {
                return encrypted;
            }
        }
    }

    public decrypt(inputText: string): string {

        if (inputText.search("pbkdf2:") == 0) {

            // Equivalent shell command: xxd -p -r | openssl enc -aes-256-cbc -pbkdf2 -d
            inputText = inputText.slice(7);
            var hexsalt = inputText.substring(16, 32);
            var binsalt = Buffer.from(hexsalt, 'hex')
            inputText = inputText.slice(32);
            // Derive a key using PBKDF2.
            // https://github.com/nodejs/node/issues/27802
            let derivedKey = crypto.pbkdf2Sync(this.password, binsalt, 10000, 48, 'sha256');
            let key = derivedKey.slice(0, 32);
            let iv = derivedKey.slice(32, 48);

            let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            var decrypted = decipher.update(inputText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } else {
            var decrypted: string = "";
            var ended = false;
            var saltedPassword = this.password;
            if (this.useSalt) {
                var salt = inputText.substring(0, this.saltSize * 2);
                inputText = inputText.replace(salt, "");
                saltedPassword = salt + this.password;
            }
            const decipher = crypto.createDecipher('aes-256-cbc', saltedPassword);
            decrypted = decipher.update(inputText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            ended = true;
            return decrypted;
        }
    }

    public setUseSalt(useSalt: boolean) {
        this.useSalt = useSalt;
    }

    public setPassword(password: string): void {
        this.password = password;
        this.shouldAskForPassword = false;
        this.provider.reload();
    }

    public forgetPassword(): void {
        this.password = null;
        this.shouldAskForPassword = true;
        this.provider.reload();
    }

    public askPassword(): Thenable<void> {
        var self = this;
        return vscode.window.showInputBox({
            password: true, prompt: "What's the password to encrypt/decrypt this message?", placeHolder: "password", ignoreFocusOut: true,
            validateInput: this.validatePassword
        }).then(function (password) {
            if (password) {
                self.setPassword(password);
                return Promise.resolve();
            }
            return Promise.reject();
        });
    }

    private validatePassword(password: string): string {
        if (password === undefined || password === null || password === "") {
            return "You must provide a password";
        }
        if (password.length <= 4) {
            return "The password must have at least 5 characters";
        }
        return undefined;
    }
}