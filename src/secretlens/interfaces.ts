export interface ISecretLensFunction {

    password: string;
    shouldAskForPassword: boolean;
    encrypt(inputText: string): string;
    decrypt(inputText: string): string;
    setPassword(): Thenable<string>

}
