# SecretLens README

A CodeLens provider that automatically decrypts a line of text and show as a CodeLens.

## Features

Show a CodeLens with text decrypted from the line.

If a line starts with `secretlens:` (configurable) then the rest of the line is decrypted by a function (can be customized) and displayed inline.

It has two commands:
- `encrypt`: Encrypt the current line and puts the `startsWith` text in the begining
- `decrypt`: Decrypt the current line and removes the `startsWith` text

## Extension Settings

This extension has the following settings:

* `secretlens.startsWith`: Text for the extension to act upon line
* `secretlens.secretFunctionFilePath`: File path for file with custom function for SecretLens to apply to your text

### For use with a custom file (`secretFunctionFilePath` setting)

The file contents should follow this spec. The extension provide a code snippet (`slfunction`) to help the creation of that file.

It should have a `encrypt` and a `decrypt` function with your custom code in it.

```javascript
"use strict";
var MySecretFunction = (function () {
    function MySecretFunction() {
    }
    MySecretFunction.prototype.encrypt = function (inputText) {
        return inputText;
    };
    MySecretFunction.prototype.decrypt = function (inputText) {
        return inputText;
    };
    return MySecretFunction;
} ());
exports.instance = new MySecretFunction();
``` 

## Known Issues

None

## Release Notes

### 1.0.0

Initial release of SecretLens.

## Roadmap

- [ ] Use crypto api as the default implementation 
- [ ] Ask for a password for encryption/decryption
- [ ] Better tests