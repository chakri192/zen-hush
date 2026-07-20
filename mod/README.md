# Zen Hush (mod)

Restyles Zen Browser's built-in background-tab toast — the small popup behind `zen.view.compact.show-background-tab-toast`. Every visual property is a dropdown in the Marketplace settings panel, no manual CSS editing.

<div align="center">
  <img src="screenshot.png" alt="Zen Hush toast" width="500" />
</div>

## What it changes

- **Show toast at all** — on / fully off
- **Opacity** — 100 / 85 / 65 / 45%
- **Background** — dark glass, light glass, solid black, accent tint
- **Blur** — none, subtle, standard, heavy
- **Corner rounding** — square, soft, rounded, pill
- **Text size** — small, medium, large
- **Max width** — compact, standard, wide
- **Distance from screen edge** — tight, normal, loose
- **Fade speed** — instant, fast, slow

Ships with a solid, no-blur look by default — that read cleaner against a busy desktop than the glassy default it started with.

## Selector note

Targets `hbox.zen-toast` directly. This was confirmed by live-inspecting the toast in the Browser Toolbox — other public mods reference `#zen-toast-container` and `.description`, but this build's markup has no wrapper container and no `.description` class. Don't copy those selectors from elsewhere; they won't match.

## Install (local testing)

1. `about:config` → confirm `toolkit.legacyUserProfileCustomizations.stylesheets` is `true`.
2. Copy `chrome.css` into your Zen profile's `chrome/` folder (create it if missing — `about:support` → "Profile Folder" → Open Folder, then make a `chrome/` subdirectory).
3. Fully quit Zen (`Cmd+Q`) and reopen.

## Install (as a Marketplace mod)

This folder follows the submission layout: `chrome.css` + `preferences.json` + this README + a 600×400 screenshot. See the top-level `../README.md` for the full checklist.

## Scope and limits

This mod only controls the toast's *appearance*. It can't read the clock or know which site triggered a notification — that needs JavaScript, which Zen Mods don't run. Scheduled quiet hours and per-site muting live in the companion WebExtension at `../extension`.
