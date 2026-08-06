<div align="center">

# zen-hush

**Notification decluttering for [Zen Browser](https://zen-browser.app).**

Restyle the background-tab toast. Silence the web `Notification` API on a schedule. Two independent pieces, either one on its own.

<p>
  <img alt="Browser" src="https://img.shields.io/badge/Zen%20Browser-115%2B-1c1c1e?style=flat-square&logo=firefoxbrowser&logoColor=FF7139" />
  <img alt="Manifest" src="https://img.shields.io/badge/WebExtension-MV3-1c1c1e?style=flat-square" />
  <img alt="Mod" src="https://img.shields.io/badge/mod-pure%20CSS-1c1c1e?style=flat-square&logo=css3&logoColor=1572B6" />
  <img alt="Dependencies" src="https://img.shields.io/badge/dependencies-none-1c1c1e?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-1c1c1e?style=flat-square" />
</p>

<br />

<img src="mod/screenshot.png" alt="The restyled Zen background-tab toast" width="600" />

</div>

<br />

---

## Two pieces, on purpose

Zen Mods are CSS plus a settings manifest — no JavaScript. That's plenty for deciding *how a toast looks*, and useless for deciding *whether it should fire at 2am*. So the two concerns live apart:

| | What it controls | How it installs |
|---|---|---|
| **`mod/`** | Appearance of Zen's built-in background-tab toast | Drop a file in your profile's `chrome/` folder |
| **`extension/`** | Whether web notifications fire at all | Load through `about:debugging` |

Use either. Use both. They don't know about each other.

---

## mod — toast declutter

Targets `hbox.zen-toast`, the element behind `zen.view.compact.show-background-tab-toast`.

> That selector was confirmed by inspecting a live toast in the Browser Toolbox. Other public Zen mods reference `#zen-toast-container` and `.description` — this build's markup is flatter than that, with no container wrapper and an unclassed `<label>` for the text. Don't copy those selectors blind; check your own build.

Every value below is a CSS variable, adjustable from the Marketplace settings panel once installed, or by editing the fallback in `chrome.css` directly:

**Show toast at all** · **Opacity** (100 / 85 / 65 / 45%) · **Background** (dark glass, light glass, solid black, accent tint) · **Blur** (none → heavy) · **Corner rounding** (square → pill) · **Text size** · **Max width** · **Distance from edge** · **Fade speed**

Shipped defaults are a solid background and no blur — the glassy look it originally had disappeared into a busy desktop.

### Installing it

```zsh
PROFILE=~/Library/Application\ Support/zen/Profiles/<your-profile>.default
cp mod/chrome.css "$PROFILE/chrome/zen-hush.css"
```

Add to `userChrome.css` in that same folder:

```css
@import url("zen-hush.css");
```

Set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true` in `about:config`, then fully quit Zen with `Cmd+Q` — closing the window isn't enough — and reopen.

---

## extension — quiet hours and per-site muting

The mod can restyle a toast; it cannot stop a notification. Stopping one means getting between the page and the browser, which means an extension.

`zen-hush` replaces `window.Notification` with a wrapper of the same shape. During quiet hours, or on a muted host, constructing one yields an inert stand-in instead of a real system notification — and because the interface is preserved, page scripts that set `.onclick` or call `.close()` carry on without throwing.

Quiet hours wrap past midnight, so `22:00 → 07:00` behaves the way you'd expect instead of matching nothing.

### Installing it

```
about:debugging#/runtime/this-firefox → Load Temporary Add-on → extension/manifest.json
```

Temporary add-ons are cleared when the browser restarts; this isn't signed or on AMO yet.

---

## How the extension is put together

Three scripts, because no single context can see everything it needs:

**`inject.js` — MAIN world.** Runs in the page's own JavaScript context, the only place `window.Notification` can be replaced. In exchange it has no access to `browser.*` whatsoever.

**`bridge.js` — isolated world.** Seventeen lines whose entire job is relaying `postMessage` from the page to `browser.runtime` and back. It exists purely because of that split, and does nothing else.

**`background.js`.** Owns the settings and answers exactly one question: is this host silenced right now? The quiet-hours arithmetic and the muted-host list both live here, so the page never sees your configuration.

### The race that made it feel unreliable

Fetching the rules is asynchronous, but a page can fire a notification at `document_start` — before the answer comes back. Early on, anything in that sub-second window escaped the filter entirely, which reads to a user as "it sometimes doesn't work."

The wrapper now parks any notification constructed before the rules load. When they arrive, parked ones are either fired for real or dropped, according to what the rules turned out to say. One that was `close()`d while parked stays dropped, so a late cancellation can't resurface as a delayed pop-up.

---

## Requirements

A recent Zen Browser build. For the mod, `toolkit.legacyUserProfileCustomizations.stylesheets` set to `true`. For the extension, nothing further — Zen is Firefox-based, and the manifest declares `strict_min_version` 115.

---

## When it doesn't work

| Symptom | Cause |
|---|---|
| Toast still looks stock after restarting | The stylesheets pref isn't `true`, the `@import` is commented out, or Zen was closed rather than quit with `Cmd+Q` |
| CSS loads, nothing changes | Your build's toast markup differs. Inspect it live with the Browser Toolbox (`Cmd+Alt+Shift+I`) and check what `.zen-toast` actually contains |
| The toast vanishes before you can inspect it | Don't try to catch it by clicking. Attach a `MutationObserver` in the Browser Toolbox console and log `outerHTML` the moment the node appears |
| A muted site still notifies | Check the host string matches — the mute list keys on `location.hostname` exactly, so `www.example.com` and `example.com` are separate entries |
| Extension gone after a restart | Expected. Temporary add-ons don't persist; reload it from `about:debugging` |

---

## Layout

```
zen-hush/
├── mod/
│   ├── chrome.css          .zen-toast, every value a CSS variable
│   ├── preferences.json    the Marketplace settings schema
│   └── screenshot.png
├── extension/
│   ├── manifest.json       MV3, two content scripts — one per world
│   ├── inject.js           the Notification wrapper + pending queue
│   ├── bridge.js           MAIN ↔ isolated relay
│   ├── background.js       settings, quiet-hours logic, mute list
│   └── options.html/.js    the popup
└── LICENSE
```

---

## Status

Functional and in daily use. Not yet submitted to the Zen Marketplace or AMO, so the mod is a manual file copy and the extension is a temporary add-on.

---

## License

MIT — see [LICENSE](LICENSE).

## Contributors

| | |
|---|---|
| [chakri192](https://github.com/chakri192) | Author |
| [aider](https://github.com/Aider-AI/aider) | AI pair programmer |
