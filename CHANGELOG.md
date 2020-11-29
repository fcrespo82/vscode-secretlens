# Change Log
All notable changes to the "vscode-markdown-table-formatter" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [2.2.1] - 2020-11-29

- [CHANGE] Upgraded dependencies

## [2.2.0] - 2020-02-24

- [NEW] Added a second crypto option ([pbkdf2](https://en.wikipedia.org/wiki/PBKDF2)) that for better long term support. Thanks [@fredatatlantis](https://github.com/fredatatlantis)!


## [2.1.3] - 2019-07-15

- [FIX] Fix node deprecation causing extension not working at all (bug #9)


## [2.1.2] - 2019-05-27

- [NEW] Adopt no reload on install


## [2.1.1] - 2019-05-27


## [2.1.0] - 2019-05-16

- [NEW] You can now encrypt/decrypt hole files
- [NEW] You can now encrypt/decrypt each file inside a folder (can be configured to do it recursively)


## [2.0.2] - 2019-05-13


## [2.0.0] - 2018-10-05

- [NEW] You can set a grace period (in seconds) in which the password will be remembered (defaults to always)
- [CHANGE] Changed to a start/end token for secret encryption to overcome the limitation described in [#2](https://github.com/fcrespo82/vscode-secretlens/issues/2)
- [FIX] Mantains the selection after encrypt/decrypt


## [1.5.0] - 2018-09-17

- [NEW] Now it's possible to have multiple secrets on the same line  
  The secret will be encrypted/decrypted/copyed inplace respecting its boundaries
- [NEW] Configuration for separator when copying multiple secret copy
- [CHANGE] Removed limitation of multiple secret copy
- [CHANGE] Changed Mac keybinding to <kbd>cmd</kbd> for consistency with the platform
- [FIX] More consistency in asking for a password, showing lens warning for bad password


## [1.4.0] - 2018-05-04

- [NEW] Support for displaying the secret as CodeLens or Hover (defaults to CodeLens)
- [CHANGE] The click command on CodeLens now copy the secret
- [FIX] Ask for the password if the user tries to copy the secret

## [1.3.2] - 2018-05-02


## [1.3.1] - 2018-05-02


## [1.3.0] - 2018-02-26

- [NEW] Support for copying secret directly (default keybinding: <kbd>ctrl</kbd>+<kbd>l</kbd> <kbd>ctrl</kbd>+<kbd>c</kbd>)


## [1.2.0] - 2017-09-20

- [NEW] Support for multi line and multi selection
- [REMOVED] Support for custom code and snippet as crypto-js implementation is already secure


## [1.1.0] - 2016-12-08

- [NEW] Crypto api as the default implementation 
- [NEW] Ask for a password for encryption/decryption
- [CHANGE] The default keymaps (old ones were conflicting with save)
- [CHANGE] The custom code
- [CHANGE] The code snippet to reflect above change


## [1.0.2] - 2016-12-05

- [FIX] A wrong command firing, when executing the extension from the keybinding or the command palette
- [NEW] a warning message to educate users on how to use the extension


## [1.0.1] - 2016-12-05

- [FIX] "Command not found bug" that prevents the extension to work completely 


## [1.0.0] - 2016-12-02

- [NEW] Initial release of SecretLens.