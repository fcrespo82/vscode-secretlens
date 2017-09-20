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
* `secretlens.languages`: Languages in which SecretLens will run. Defaults to ALL

## Known Issues

None
