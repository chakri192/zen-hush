// Zen Hush — background
// Owns the persisted settings and answers "should this page's Notification
// calls be suppressed right now?" queries from content scripts.

const DEFAULTS = {
  dndEnabled: false,
  dndStart: "22:00",
  dndEnd: "07:00",
  mutedSites: [],
};

async function getSettings() {
  const stored = await browser.storage.local.get(DEFAULTS);
  return { ...DEFAULTS, ...stored };
}

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg?.type === "zen-hush-get-rules") {
    // The page checks the time itself on every notification (see inject.js),
    // so it gets the schedule rather than a yes/no answer that would go stale.
    const s = await getSettings();
    return {
      dndEnabled: s.dndEnabled,
      dndStart: s.dndStart,
      dndEnd: s.dndEnd,
      muted: s.mutedSites.includes(msg.host),
    };
  }

  if (msg?.type === "zen-hush-mute-site") {
    const s = await getSettings();
    if (!s.mutedSites.includes(msg.host)) {
      s.mutedSites.push(msg.host);
      await browser.storage.local.set({ mutedSites: s.mutedSites });
    }
    return { ok: true };
  }

  if (msg?.type === "zen-hush-unmute-site") {
    const s = await getSettings();
    const mutedSites = s.mutedSites.filter((h) => h !== msg.host);
    await browser.storage.local.set({ mutedSites });
    return { ok: true };
  }
});
