# Zen Hush (extension)

A Firefox/Zen WebExtension that adds scheduled Do Not Disturb hours and per-site muting for the standard web `Notification` API — the logic layer the CSS-only mod in `../mod` can't provide.

## How it works

- **`inject.js`** — runs in the page's MAIN world at `document_start`, replaces `window.Notification` with a wrapper. Suppressed calls return an inert stand-in; everything else passes through untouched.
- **`bridge.js`** — runs in the extension's isolated world, the only piece with `browser.*` API access. Relays `postMessage` traffic between the page and the background script.
- **`background.js`** — owns settings in `browser.storage.local`, answers "is this host muted, or are we inside the DND window right now?" for each page that asks.
- **`options.html` / `options.js`** — the popup UI: toggle scheduled DND, set a start/end time (overnight ranges like 22:00 → 07:00 work), mute the current tab's site, unmute from a list.

## Load it (temporary, for development)

1. `about:debugging#/runtime/this-firefox` (works the same in Zen)
2. **Load Temporary Add-on** → select `manifest.json` in this folder
3. Visit any site that requests notification permission, grant it, then test from the console: `new Notification("test")`

## Known limits

- `world: "MAIN"` content scripts require Firefox 128+ (Zen tracks recent Firefox releases, so this should be a non-issue)
- Rules load asynchronously on page load — a `Notification` fired in the first few milliseconds can slip through before the bridge responds. Fine for chat-app/email-tab muting, not airtight against adversarial pages
- Mutes the **page-level** Notification API only — doesn't touch Zen's own background-tab toast (`.zen-toast`). Pair with `../mod` for that
