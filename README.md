# SecretLens README

A CodeLens provider that automatically decrypts a line of text and show as a CodeLens.

## Features

Show a CodeLens with text decrypted from the line.

If a line starts with `secretlens:` (config option) then the rest of the line is decrypted by a function (config option) and displayed inline.

It has two commands:
- `encrypt`: Encrypt the current line and puts the `startsWith` text in the begining
- `decrypt`: Decrypt the current line and removes the `startsWith` text

## Extension Settings

This extension has the following settings:

* `secretlens.startsWith`: Text for the extension to act upon line
* `secretlens.customSecretFunctionFilePath`: File path for file with custom function for SecretLens to apply to your text. [Default: undefined]

### For use with a custom file (`customSecretFunctionFilePath` setting)

The file contents should follow the following spec. The extension provide a code snippet (`slfunction`) to help the creation of that file.

It should have a `encrypt` and a `decrypt` function with your custom code in it.

```javascript
"use strict";
var SecretLensFunction = (function () {
    function SecretLensFunction() {
    }
    SecretLensFunction.prototype.encrypt = function (inputText) {
        return "#" + inputText + "#";
    };
    SecretLensFunction.prototype.decrypt = function (inputText) {
        return inputText.substring(1, inputText.length - 1);
    };
    return SecretLensFunction;
}());
exports.customSecretFunction = SecretLensFunction;
``` 

## Known Issues

None

## Roadmap

- [ ] Use crypto api as the default implementation 
- [ ] Ask for a password for encryption/decryption
- [ ] Better tests
- [ ] Added a TypeScript snippet but it must be converted to JS prior to use