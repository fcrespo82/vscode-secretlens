# SecretLens README

A CodeLens/Hover provider that automatically decrypts identified text and show as a CodeLens/Hover.

## What this extension do?

Encrypt/decrypt text within the file.

### How?

Encrypting accepts your selection, or hole line if no selection, encrypts it and replaces for the fenced block `${token}:<your text>:${token}` (token is configurable)

Decrypting searchs for the fenced block and then replaces by the plain text. 

The fenced block is the default behavior because of [this limitation](https://github.com/fcrespo82/vscode-secretlens/issues/2).
If you want to keep the previous behavior set `excludeEnd` option to true


## Extension Commands

- **Encrypt**: Encrypt the current line and replaces for `${token}:<encrypted>:${token}`
- **Decrypt**: Decrypt the current line
- **Set password**: Set a new password
- **Forget password**: Forget the current password
- **Copy secret**: Copy the selected secrets decrypted to clipboard

## Extension Settings

- **Token**: Token for identifying the encrypted text. Defaults to `secretlens`
- **Exclude end**: Should include the end fence when encrypting texts. Defaults to false.
- **Copy separator**: Separator for when copying multiple secrets. Defaults to `\n`
- **Languages**: Languages in which SecretLens will run. Defaults to ALL
- **Remember period**: How many seconds the password will be remembered before being erased from cache

- - -


If you like this extension, please consider [donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6H283FQKCUB9G) and/or take a moment to [write a review](https://marketplace.visualstudio.com/items?itemName=fcrespo82.secretlens#review-details) and share on <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Dfcrespo82.secretlens%23overview">Facebook</a> or <a href="https://www.twitter.com/home?status=Just%20discovered%20this%20on%20the%20%23VSMarketplace%3A%20https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Dfcrespo82.secretlens%23overview">Twitter</a>
<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
<input type="hidden" name="cmd" value="_s-xclick">
<input type="hidden" name="hosted_button_id" value="6H283FQKCUB9G">
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
<img alt="" border="0" src="https://www.paypalobjects.com/pt_BR/i/scr/pixel.gif" width="1" height="1">
</form>


