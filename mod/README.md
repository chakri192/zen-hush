# Zen Hush (mod)

A Zen Browser Mod that restyles and quiets the built-in background-tab toast
(`#zen-toast-container` / `.zen-toast` — the element behind the
`zen.view.compact.show-background-tab-toast` pref). Every visual property is
exposed as a setting in Zen's Marketplace panel — no manual CSS editing.

## What it changes

| Setting | Options |
|---|---|
| Show background-tab toast | Enabled / fully disabled |
| Opacity | 100% / 85% / 65% / 45% |
| Background | dark glass, light glass, solid black, accent tint |
| Blur | none, subtle, standard, heavy |
| Corner rounding | square, soft, rounded, pill |
| Text size | small, medium, large |
| Max width | compact, standard, wide |
| Distance from screen edge | tight, normal, loose |
| Fade speed | instant, fast, slow |

## Install (local testing)

1. `about:config` → confirm `toolkit.legacyUserProfileCustomizations.stylesheets` is `true`.
2. Copy `chrome.css` into your Zen profile's `chrome/` folder (create it if missing:
   `about:support` → "Profile Folder" → `Open Folder`, then make a `chrome/` subdir).
3. Restart Zen.

## Install (as a Marketplace mod)

This folder follows the `zen-browser/theme-store` submission layout
(`chrome.css` + `preferences.json` + this README + a 600x400 screenshot).
See `../README.md` for the submission checklist.

## Scope and limits

This mod only controls the toast's *appearance*. It can't read the clock or
know which site triggered a notification — that requires JavaScript, which
Zen Mods don't run. Scheduled quiet hours and per-site muting live in the
companion WebExtension at `../extension`.
