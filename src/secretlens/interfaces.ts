export interface ISecretLensFunction {

    password: string;
    shouldAskForPassword: boolean;
    encrypt(inputText: string): Thenable<string>;
    decrypt(inputText: string): Thenable<string> | string;

}
