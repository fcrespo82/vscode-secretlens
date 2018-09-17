## Changelog

### 1.4.0

- [NEW] Support for displaying the secret as CodeLens or Hover (defaults to CodeLens)
- [CHANGED] The click command on CodeLens now copy the secret
- [FIX] Ask for the password if the user tries to copy the secret

### 1.3.0

- [NEW] Support for copying secret directly (default keybinding: <kbd>ctrl</kbd>+<kbd>l</kbd> <kbd>ctrl</kbd>+<kbd>c</kbd>)

### 1.2.0

- [NEW] Support for multi line and multi selection
- [REMOVED] Support for custom code and snippet as crypto-js implementation is already secure

### 1.1.0

- [NEW] Crypto api as the default implementation 
- [NEW] Ask for a password for encryption/decryption
- [CHANGED] The default keymaps (old ones were conflicting with save)
- [CHANGED] The custom code
- [CHANGED] The code snippet to reflect above change

### 1.0.2

- [FIX] A wrong command firing, when executing the extension from the keybinding or the command palette
- [NEW] a warning message to educate users on how to use the extension

### 1.0.1

- [FIX] "Command not found bug" that prevents the extension to work completely 

### 1.0.0

- [NEW] Initial release of SecretLens.