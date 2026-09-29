# zen-hush

Quieter notifications for [Zen Browser](https://zen-browser.app). It has two parts, and you can use either one on its own:

- **Mod**: restyles or hides Zen's "New background tab opened!" popup.
- **Extension**: mutes website notifications during quiet hours or for sites you choose.

<img src="screenshot.png" alt="Restyled Zen toast" width="550" />

## Mod

Change how the background-tab popup looks: opacity, background, blur, corner rounding, text size, width, and fade speed. You can also hide it completely.

### Install

1. Go to `about:config` and set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true`.
2. Find your profile folder: `about:support` → Profile Folder.
3. Copy the stylesheet into its `chrome` folder:

   ```sh
   PROFILE=~/Library/Application\ Support/zen/Profiles/<your-profile>
   mkdir -p "$PROFILE/chrome"
   cp mod/chrome.css "$PROFILE/chrome/zen-hush.css"
   ```

4. Add this line to `$PROFILE/chrome/userChrome.css` (create the file if it doesn't exist):

   ```css
   @import url("zen-hush.css");
   ```

5. Quit Zen completely with `Cmd+Q` and reopen it.

## Extension

- **Do Not Disturb schedule**: no website notifications between two times you pick (default 22:00 to 07:00).
- **Mute a site**: silence notifications from the current website with one click.

Open it from the toolbar button.

### Install

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on** and choose `extension/manifest.json`.

Temporary add-ons are removed when Zen restarts, so you'll need to load it again after each restart.

### Notes

- Changes apply to open tabs straight away; no reload needed.
- Needs Zen (or Firefox) based on Firefox 128 or newer.
- `www.example.com` and `example.com` count as different sites.
- Notifications sent by a site's background service worker aren't blocked.

## Troubleshooting

| Problem | Fix |
|---|---|
| Popup looks the same | Check the `about:config` setting and the `@import` line, then quit Zen with `Cmd+Q` |
| A muted site still notifies | Check the site name matches exactly (`www.` counts) |
| Extension disappeared | Load it again from `about:debugging` |

## License

MIT

## Contributors

| | |
|---|---|
| [chakri192](https://github.com/chakri192) | Author |
| [aider](https://github.com/Aider-AI/aider) | AI pair programmer |
