# zen-hush mod

Restyles Zen Browser's "New background tab opened!" popup, or hides it.

<p align="center">
  <img src="screenshot.png" alt="zen-hush toast" width="500" />
</p>

## Settings

- Show or hide the popup
- Opacity: 100%, 85%, 65%, 45%
- Background: dark glass, light glass, solid black, accent colour
- Blur: none, subtle, standard, heavy
- Corners: square, soft, rounded, pill
- Text size: small, medium, large
- Width: compact, standard, wide
- Fade speed: instant, fast, slow

## Install

1. In `about:config`, set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true`.
2. Open `about:support` → Profile Folder. Create a `chrome` folder there if it doesn't exist.
3. Copy `chrome.css` into it as `zen-hush.css`, and add `@import url("zen-hush.css");` to `chrome/userChrome.css`.
4. Quit Zen with `Cmd+Q` and reopen it.

To change settings without the Marketplace, edit the default values in `chrome.css`.
