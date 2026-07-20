# zen-hush

Notification decluttering for [Zen Browser](https://zen-browser.app): a CSS mod that restyles the built-in background-tab toast, and a companion WebExtension that adds scheduled Do Not Disturb hours and per-site muting for the web `Notification` API. Use either independently or together.

---

## Why two parts

Zen Mods are CSS + a JSON preferences manifest — no JavaScript, no access to the clock, no access to which site is asking. That covers *how a toast looks*, but not *whether it should fire at 2am* or *whether this one site is allowed to interrupt you*. So the logic lives in a separate WebExtension instead.

| | `mod/` | `extension/` |
|---|---|---|
| Controls | Appearance of Zen's own background-tab toast | Whether the web page's `Notification` API fires at all |
| Built with | `chrome.css` + `preferences.json` | Firefox WebExtension (Manifest V3) |
| Install via | Drop into your profile's `chrome/` folder, or Zen Marketplace once submitted | `about:debugging` (temporary) or AMO once packaged |
| Logic | None — pure CSS custom properties | DND schedule, per-site mute list, stored in `browser.storage.local` |

---

## mod/ — toast declutter

Targets `hbox.zen-toast`, the element behind `zen.view.compact.show-background-tab-toast`. Confirmed via live inspection in the Browser Toolbox — public mods online reference `#zen-toast-container` / `.description`, but this Zen build's actual markup is flatter than that (no wrapper container, no `.description` class), so the selectors here were fixed to match what's really on screen.

| Setting | Options | CSS variable |
|---|---|---|
| Show toast at all | enabled / fully off | `--mod-zenhush-display` |
| Opacity | 100% / 85% / 65% / 45% | `--mod-zenhush-opacity` |
| Background | dark glass, light glass, solid black, accent tint | `--mod-zenhush-background_color` |
| Blur | none, subtle, standard, heavy | `--mod-zenhush-blur` |
| Corner rounding | square, soft, rounded, pill | `--mod-zenhush-border_radius` |
| Text size | small, medium, large | `--mod-zenhush-font_size` |
| Max width | compact, standard, wide | `--mod-zenhush-max_width` |
| Distance from edge | tight, normal, loose | `--mod-zenhush-spacing_multiplier` |
| Fade speed | instant, fast, slow | `--mod-zenhush-fade_duration` |

Current defaults are solid (opacity `1`, blur `0px`) rather than glassy — tuned that way after testing looked better against a busy desktop. Adjust the fallback values in `chrome.css` directly, or the pref dropdowns once installed through the Marketplace.

## extension/ — Do Not Disturb + site muting

Wraps `window.Notification` in the page itself so pages can't interrupt during scheduled quiet hours or on muted sites, while leaving everything else untouched.

1. `inject.js` runs in the page's MAIN world, replaces `window.Notification` with a wrapper that either passes through or returns an inert stand-in.
2. `bridge.js` runs in the extension's isolated world and relays `postMessage` traffic between the page and the background script — MAIN-world scripts have no `browser.*` API access.
3. `background.js` owns settings in `browser.storage.local` (DND start/end, muted-site list) and answers "suppress or not?" for each page that asks.
4. `options.html` / `options.js` is the popup: toggle DND, set start/end time (overnight ranges like 22:00 → 07:00 work), mute the current tab, unmute from a list.

---

## Requirements

- [Zen Browser](https://zen-browser.app), a recent build (tracks Firefox ~150+)
- `toolkit.legacyUserProfileCustomizations.stylesheets` set to `true` in `about:config`, for the mod

---

## Installation

### mod

```zsh
PROFILE=~/Library/Application\ Support/zen/Profiles/<your-profile>.default
cp mod/chrome.css "$PROFILE/chrome/zen-hush.css"
```

Then add to `userChrome.css` in that same folder (or wherever your existing `@import` chain lives):

```css
@import url("zen-hush.css");
```

Fully quit Zen (`Cmd+Q`) and reopen.

### extension (temporary, for local testing)

```
about:debugging#/runtime/this-firefox → Load Temporary Add-on → select extension/manifest.json
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Toast still looks stock after restart | Confirm `toolkit.legacyUserProfileCustomizations.stylesheets` is `true`, confirm the `@import` line is correct and not commented out, and confirm you fully quit (`Cmd+Q`) rather than just closing the window |
| CSS loads but nothing changes | Selectors may not match your Zen version — inspect the live toast via the Browser Toolbox (`Cmd+Alt+Shift+I`) and check `.zen-toast`'s actual structure |
| Toast disappears before you can inspect it | Use a `MutationObserver` in the Browser Toolbox console to log `outerHTML` the instant it's added, instead of trying to click it live |
| Extension doesn't suppress a site's notifications | Rules load asynchronously on page load — a `Notification` fired in the first few milliseconds can slip through; reload the page after muting |

---

## Project structure

```
zen-hush/
├── mod/
│   ├── chrome.css          # the actual restyling
│   ├── preferences.json    # Marketplace settings panel definitions
│   └── README.md
├── extension/
│   ├── manifest.json
│   ├── background.js       # settings + DND/mute logic
│   ├── bridge.js            # isolated-world relay
│   ├── inject.js            # MAIN-world Notification wrapper
│   ├── options.html / options.js
│   └── README.md
├── LICENSE
└── README.md
```

---

## Status

Functional. `mod/` selectors confirmed against a live Zen install rather than guessed from other public mods. Not yet submitted to the Zen Marketplace or AMO.

## License

MIT

## Contributors

| Contributor | Role |
|---|---|
| [chakri192](https://github.com/chakri192) | Author |
| Claude | AI pair programmer |
