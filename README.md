# SecretLens

![Installs](https://vsmarketplacebadge.apphb.com/installs-short/fcrespo82.secretlens.svg)
![Rating](https://vsmarketplacebadge.apphb.com/rating-star/fcrespo82.secretlens.svg)


- - -
**WARNING**

Version 2.0.0 breaks compatibility with current encrypted messages **unless** you follow the steps described in [Keep the previous behavior](#keep-the-previous-behavior)
- - -

A CodeLens/Hover provider that automatically decrypts identified text and show as a CodeLens/Hover.

## What does this extension do?

Encrypt/decrypt text within the file.

### How?

Encrypting accepts your selection, or hole line if no selection, encrypts it and replaces with the fenced block `${token}<your text>${endToken}` (token/endToken are configurable)

Decrypting search for the fenced block and then replaces by the plain text. 

The fenced block is the default behavior because of [this limitation](https://github.com/fcrespo82/vscode-secretlens/issues/2).

#### Keep the previous behavior

1. Set **Start token** to `secretlens:`
2. Set **End token** to empty string or `null`
3. Set **Exclude end fence** option to `true`


## Extension Commands

| Command             | Description                                                                    |
|:--------------------|:-------------------------------------------------------------------------------|
| **Encrypt**         | Encrypt the text and replaces with `${token}<encrypted text>${endToken}`       |
| **Decrypt**         | Decrypt the fenced block and replaces with `<decrypted text>`                  |
| **Set password**    | Set a new password                                                             |
| **Forget password** | Clears the current password                                                    |
| **Copy secret**     | Copy the selected secrets decrypted to clipboard separated by *Copy separator* |


## Extension Settings

| Setting                  | Description                                                                     |         Default Value         |
|:-------------------------|:--------------------------------------------------------------------------------|:-----------------------------:|
| **Display Type**         | How to display the secret: CodeLens, Hover or both                              |           CodeLens            |
| **Start token**          | Token for identifying the begining of encrypted text                            |            `<sl:`             |
| **End token**            | Token for identifying the end of encrypted text                                 |            `:sl>`             |
| **Exclude end fence**    | Exclude the end fence when encrypting texts                                     |             false             |
| **Language identifiers** | Languages in which SecretLens will run                                          |              ALL              |
| **Copy separator**       | Separator for when copying multiple secrets                                     |             `\n`              |
| **Remember period**      | How many seconds the password will be remembered before being erased from cache |         -1 (forever)          |
| **Recursive**            | Go inside subdirectories to encrypt/decrypt files                               |             false             |
| **Crypto method**        | How the secrets are encrypted                                                   | Default legacy implementation |

- - -


If you like this extension, please consider [donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6H283FQKCUB9G) and/or take a moment to [write a review](https://marketplace.visualstudio.com/items?itemName=fcrespo82.secretlens#review-details) and share on <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Dfcrespo82.secretlens%23overview">Facebook</a> or <a href="https://www.twitter.com/home?status=Just%20discovered%20this%20on%20the%20%23VSMarketplace%3A%20https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Dfcrespo82.secretlens%23overview">Twitter</a>
<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
<input type="hidden" name="cmd" value="_s-xclick">
<input type="hidden" name="hosted_button_id" value="6H283FQKCUB9G">
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
<img alt="" border="0" src="https://www.paypalobjects.com/pt_BR/i/scr/pixel.gif" width="1" height="1">
</form>


