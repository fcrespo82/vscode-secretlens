export interface ISecretLensFunction {

    encode(inputText: string): string;
    decode(inputText: string): string;

}

export class SecretFunctionDefault implements ISecretLensFunction {

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

    encode(inputText: string): string {
        return this.rot47(inputText);
    }

    decode(inputText: string): string {
        return this.rot47(inputText);
    }
}