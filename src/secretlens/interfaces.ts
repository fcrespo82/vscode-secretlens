export interface ISecretLensFunction {

    password:string;
    encrypt(inputText: string): string;
    decrypt(inputText: string): string;

}
