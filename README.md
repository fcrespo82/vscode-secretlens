# SecretLens README

A CodeLens provider that automatically decodes a line of text and show as a CodeLens.

## Features

Show a CodeLens with text decoded from the line.

If a line starts with `secretlens:` (configurable) then the rest of the line is decoded (can have a custom function) by a function and displayed inline.

Has two commands:
- `encode`: Encode the current line and puts the `startsWith` text in the begining
- `decode`: Decode the current line and removes the `startsWith` text

## Extension Settings

This extension has the following settings:

* `secretlens.startsWith`: Text for the extension to act upon line
* `secretlens.secretFunctionFilePath`: File path for file with custom function for SecretLens to apply to your text

### For use with a custom file (`secretFunctionFilePath` setting)

The file contents should follow this spec.

It should have a `encode` and a `decode` function with your custom code in it 

```javascript
"use strict";
var MySecretFunction = (function () {
    function MySecretFunction() {
    }
    MySecretFunction.prototype.encode = function (inputText) {
        return inputText;
    };
    MySecretFunction.prototype.decode = function (inputText) {
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