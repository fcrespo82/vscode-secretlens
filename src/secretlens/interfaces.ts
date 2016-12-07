export interface ISecretLensFunction {

    password: string;
    hasPassword: boolean;
    encrypt(inputText: string): string;
    decrypt(inputText: string): string;

}
