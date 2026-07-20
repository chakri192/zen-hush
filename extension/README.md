# Zen Hush (extension)

A Firefox/Zen WebExtension that adds scheduled Do Not Disturb hours and
per-site muting for the standard web `Notification` API — the logic layer
the CSS-only mod in `../mod` can't provide.

## How it works

1. `inject.js` runs in the page's **MAIN** world at `document_start` and
   replaces `window.Notification` with a wrapper. Suppressed calls return
   an inert stand-in instead of showing a system notification; everything
   else passes through to the real constructor untouched.
2. `bridge.js` runs in the extension's isolated world (same document,
   separate JS realm) and is the only piece with `browser.*` API access.
   It relays `postMessage` traffic between the page and the background
   script.
3. `background.js` owns settings in `browser.storage.local` and answers
   "is this host muted, or are we inside the DND window right now?" for
   each page that asks.
4. `options.html` / `options.js` is the popup UI: toggle scheduled DND,
   set a start/end time (overnight ranges like 22:00 → 07:00 work), mute
   the current tab's site, and unmute from a list.

## Load it (temporary, for development)

1. `about:debugging#/runtime/this-firefox` (works the same in Zen).
2. **Load Temporary Add-on** → select `manifest.json` in this folder.
3. Visit any site that requests notification permission — grant it, then
   test with the site's own "send test notification" button if it has one,
   or from the console: `new Notification("test")`.

## Known limits

- `world: "MAIN"` content scripts require Firefox 128+ (Zen tracks recent
  Firefox releases, so this should be a non-issue).
- Rules are fetched asynchronously on page load; a `Notification` call
  that fires in the few milliseconds before the bridge responds will not
  yet be suppressed. Fine for chat-app/email-tab muting, not airtight for
  adversarial pages.
- This mutes the **page-level** Notification API only. It does not touch
  Zen's own background-tab toast (`.zen-toast`) — pair with the `../mod`
  mod for that.
