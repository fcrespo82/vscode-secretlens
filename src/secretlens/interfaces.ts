export interface ISecretLensFunction {

    encrypt(inputText: string): string;
    decrypt(inputText: string): string;

}
