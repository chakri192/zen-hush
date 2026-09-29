# zen-hush extension

Mutes website notifications in Zen Browser (or Firefox) on a schedule, or for sites you pick.

## Install

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on** and choose `manifest.json` in this folder.

It's removed when the browser restarts, so load it again after each restart.

## Use

Click the toolbar button:

- **Scheduled Do Not Disturb**: turn it on and pick a start and end time.
- **Mute this site**: silences the current website. Click × to unmute.

To test, allow notifications on a site, then run `new Notification("test")` in its console.

## Notes

- Changes apply to open tabs straight away.
- Needs Firefox 128 or newer (current Zen versions are fine).
