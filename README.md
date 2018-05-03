# SecretLens README

A CodeLens provider that automatically decrypts a line of text and show as a CodeLens.

## Features

Show a CodeLens with text decrypted from the line.

If a line starts with `secretlens:` (config option) then the rest of the line is decrypted by a function (config option) and displayed inline.

It has two commands:
- `encrypt`: Encrypt the current line and puts the `startsWith` text in the begining
- `decrypt`: Decrypt the current line and removes the `startsWith` text
- `copy`: Copy the current line decrypted to clipboard

## Extension Settings

This extension has the following settings:

* `secretlens.startsWith`: Text for the extension to act upon line
* `secretlens.languages`: Languages in which SecretLens will run. Defaults to ALL


- - -


If you like this extension, please consider [donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6H283FQKCUB9G) and/or take a moment to [write a review](https://marketplace.visualstudio.com/items?itemName=fcrespo82.secretlens#review-details) and share on <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Dfcrespo82.secretlens%23overview">Facebook</a> or <a href="https://www.twitter.com/home?status=Just%20discovered%20this%20on%20the%20%23VSMarketplace%3A%20https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Dfcrespo82.secretlens%23overview">Twitter</a>
<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
<input type="hidden" name="cmd" value="_s-xclick">
<input type="hidden" name="hosted_button_id" value="6H283FQKCUB9G">
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
<img alt="" border="0" src="https://www.paypalobjects.com/pt_BR/i/scr/pixel.gif" width="1" height="1">
</form>


