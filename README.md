# zen-hush

Notification decluttering for [Zen Browser](https://zen-browser.app).

Two independent pieces:
- **`mod/`** — restyles the built-in background-tab toast (opacity, blur, corner rounding, size)
- **`extension/`** — adds scheduled Do Not Disturb hours and per-site muting for the web `Notification` API

Use either on its own, or both together.

<p align="center">
  <img src="mod/screenshot.png" alt="zen-hush toast" width="600" />
</p>

---

## Why two pieces, not one

Zen Mods are just CSS + a settings manifest — no JavaScript. Fine for *how a toast looks*, useless for *whether it should fire at 2am*. So the two concerns are split:

**`mod/`** — pure CSS, controls appearance only, installed by dropping a file in your profile's `chrome/` folder.

**`extension/`** — a real WebExtension, controls whether notifications fire at all, installed through `about:debugging`.

---

## mod — toast declutter

Targets `hbox.zen-toast`, the element behind `zen.view.compact.show-background-tab-toast`.

> Note: this selector was confirmed by live-inspecting the toast in the Browser Toolbox. Other public Zen mods reference `#zen-toast-container` / `.description` — this build's actual markup is flatter than that, so don't copy those selectors blind.

Everything below is a CSS variable, adjustable via the Marketplace settings panel once installed (or just edit the fallback value in `chrome.css` directly):

- **Show toast at all** — on / fully off
- **Opacity** — 100 / 85 / 65 / 45%
- **Background** — dark glass, light glass, solid black, accent tint
- **Blur** — none, subtle, standard, heavy
- **Corner rounding** — square, soft, rounded, pill
- **Text size** — small, medium, large
- **Max width** — compact, standard, wide
- **Distance from edge** — tight, normal, loose
- **Fade speed** — instant, fast, slow

Current defaults: solid background, no blur — looked cleaner against a busy desktop than the glassy look it originally shipped with.

## extension — Do Not Disturb + site muting

Wraps `window.Notification` in the page so pages can't interrupt during quiet hours or on muted sites.

1. **`inject.js`** — runs in the page's MAIN world, swaps `window.Notification` for a wrapper
2. **`bridge.js`** — relays messages between the page and the background script (MAIN-world scripts can't call `browser.*` directly)
3. **`background.js`** — owns the DND schedule and mute list, answers "suppress or not?"
4. **`options.html`/`options.js`** — the popup UI: toggle DND, set hours (overnight ranges like 22:00 → 07:00 work fine), mute/unmute sites

---

## Requirements

- [Zen Browser](https://zen-browser.app), a recent build
- `toolkit.legacyUserProfileCustomizations.stylesheets` → `true` in `about:config` (for the mod)

---

## Installing the mod

```zsh
PROFILE=~/Library/Application\ Support/zen/Profiles/<your-profile>.default
cp mod/chrome.css "$PROFILE/chrome/zen-hush.css"
```

Add this to `userChrome.css` in the same folder:

```css
@import url("zen-hush.css");
```

Fully quit Zen (`Cmd+Q`) and reopen.

## Installing the extension

```
about:debugging#/runtime/this-firefox → Load Temporary Add-on → select extension/manifest.json
```

---

## Troubleshooting

**Toast still looks stock after restart**
Check the stylesheets pref is `true`, the `@import` line isn't commented out, and you fully quit with `Cmd+Q` rather than just closing the window.

**CSS loads but nothing visibly changes**
Your Zen build's markup may differ. Inspect the live toast via the Browser Toolbox (`Cmd+Alt+Shift+I`) and check `.zen-toast`'s actual structure.

**Toast disappears before you can inspect it**
Skip trying to click it live — use a `MutationObserver` in the Browser Toolbox console to log `outerHTML` the instant the element is added.

**Extension doesn't suppress a site's notifications**
Rules load asynchronously on page load, so a `Notification` fired in the first few milliseconds can slip through. Reload the page after muting a site.

---

## Project structure

```
zen-hush/
├── mod/
│   ├── chrome.css
│   ├── preferences.json
│   ├── screenshot.png
│   └── README.md
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── bridge.js
│   ├── inject.js
│   ├── options.html / options.js
│   └── README.md
├── LICENSE
└── README.md
```

---

## Status

Functional. Not yet submitted to the Zen Marketplace or AMO.

## License

MIT

## Contributors

| Contributor | Role |
|---|---|
| [chakri192](https://github.com/chakri192) | Author |
| Claude | AI pair programmer |
