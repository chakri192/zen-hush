<div align="center">

<img src="mod/screenshot.png" alt="The restyled Zen background-tab toast" width="600" />

# zen-hush

**Notification management for [Zen Browser](https://zen-browser.app).**

Two independent components: a CSS mod that restyles the background-tab toast, and a WebExtension that suppresses web notifications on a schedule.

<p>
  <img alt="Browser" src="https://img.shields.io/badge/Zen%20Browser-115%2B-1c1c1e?style=flat-square&logo=firefoxbrowser&logoColor=FF7139" />
  <img alt="Manifest" src="https://img.shields.io/badge/WebExtension-MV3-1c1c1e?style=flat-square" />
  <img alt="Mod" src="https://img.shields.io/badge/mod-pure%20CSS-1c1c1e?style=flat-square&logo=css3&logoColor=1572B6" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-1c1c1e?style=flat-square" />
</p>

</div>

---

## Overview

Zen Mods consist of CSS and a settings manifest, with no JavaScript. This is sufficient for controlling the appearance of a toast and insufficient for controlling whether it should appear at 2am. The two concerns are therefore implemented separately.

| Component | Controls | Installation |
|---|---|---|
| **`mod/`** | Appearance of the built-in background-tab toast | Copy a file into the profile's `chrome/` directory |
| **`extension/`** | Whether web notifications are delivered at all | Load through `about:debugging` |

Either may be used independently.

## Requirements

A recent Zen Browser build. The mod additionally requires `toolkit.legacyUserProfileCustomizations.stylesheets` set to `true` in `about:config`. The extension declares `strict_min_version` 115.

## mod — toast restyling

Targets `hbox.zen-toast`, the element controlled by `zen.view.compact.show-background-tab-toast`.

> This selector was confirmed by inspecting a live toast in the Browser Toolbox. Other published Zen mods reference `#zen-toast-container` and `.description`; this build's markup is flatter, with no container wrapper and an unclassed `<label>` for the text. Verify against your own build rather than copying selectors.

Every property is exposed as a CSS variable, adjustable from the Marketplace settings panel once installed, or by editing the fallback values in `chrome.css`:

visibility · opacity (100 / 85 / 65 / 45%) · background (dark glass, light glass, solid, accent tint) · blur radius · corner radius · text size · maximum width · edge offset · fade duration

The shipped defaults are a solid background with no blur, which reads more clearly against a detailed desktop than the original glass treatment.

### Installation

```sh
PROFILE=~/Library/Application\ Support/zen/Profiles/<your-profile>.default
cp mod/chrome.css "$PROFILE/chrome/zen-hush.css"
```

Add to `userChrome.css` in the same directory:

```css
@import url("zen-hush.css");
```

Enable `toolkit.legacyUserProfileCustomizations.stylesheets`, then quit Zen entirely with `Cmd+Q` — closing the window is insufficient — and reopen.

## extension — quiet hours and per-site muting

The mod can restyle a toast but cannot prevent a notification. Doing so requires intercepting the call between the page and the browser, which requires an extension.

zen-hush replaces `window.Notification` with a wrapper of equivalent shape. During configured quiet hours, or on a muted host, constructing one produces an inert object rather than a system notification. Because the interface is preserved, page scripts that assign `.onclick` or call `.close()` continue to function.

Quiet hours wrap across midnight, so a range of `22:00 → 07:00` behaves as expected.

### Installation

```
about:debugging#/runtime/this-firefox → Load Temporary Add-on → extension/manifest.json
```

Temporary add-ons are removed when the browser restarts. The extension is not yet signed or published to AMO.

## Extension architecture

Three scripts, because no single execution context has access to everything required.

**`inject.js` — MAIN world.** Executes in the page's own JavaScript context, the only place `window.Notification` can be replaced. It has no access to the `browser.*` APIs.

**`bridge.js` — isolated world.** Seventeen lines relaying `postMessage` from the page to `browser.runtime` and back. It exists solely to span that boundary.

**`background.js`.** Holds the settings and answers a single question: whether the given host is currently silenced. Quiet-hours evaluation and the muted-host list are both resolved here, so page scripts never observe the configuration.

### Handling the initialisation race

Rule retrieval is asynchronous, but a page may construct a notification at `document_start`, before the response arrives. Notifications created in that interval initially bypassed the filter entirely, which presented to the user as intermittent failure.

The wrapper now queues any notification constructed before rules are available. When they arrive, queued entries are either dispatched or discarded according to the resolved rules. An entry that was closed while queued remains discarded, so a cancelled notification cannot reappear.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Toast unchanged after restart | The stylesheets preference is not `true`, the `@import` is commented out, or Zen was closed rather than quit |
| CSS loads but has no effect | The build's toast markup differs. Inspect it with the Browser Toolbox (`Cmd+Alt+Shift+I`) |
| Toast disappears before inspection | Attach a `MutationObserver` in the Browser Toolbox console and log `outerHTML` on insertion |
| A muted site still notifies | The mute list keys on `location.hostname` exactly, so `www.example.com` and `example.com` are separate entries |
| Extension absent after restart | Expected behaviour for temporary add-ons; reload from `about:debugging` |

## Project structure

```
zen-hush/
├── mod/
│   ├── chrome.css          .zen-toast styling, fully variable-driven
│   ├── preferences.json    Marketplace settings schema
│   └── screenshot.png
└── extension/
    ├── manifest.json       MV3, two content scripts — one per world
    ├── inject.js           Notification wrapper and pending queue
    ├── bridge.js           MAIN ↔ isolated relay
    ├── background.js       Settings, quiet-hours logic, mute list
    └── options.html/.js    Configuration interface
```

## Status

Functional and in daily use. Not yet submitted to the Zen Marketplace or AMO, so the mod is installed by file copy and the extension as a temporary add-on.

## License

MIT — see [LICENSE](LICENSE).

## Contributors

| | |
|---|---|
| [chakri192](https://github.com/chakri192) | Author |
| [aider](https://github.com/Aider-AI/aider) | AI pair programmer |
