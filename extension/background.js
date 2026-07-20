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

// Handles overnight ranges (e.g. 22:00 -> 07:00) as well as same-day ranges.
function isWithinDnd(start, end) {
  if (start === end) return false;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  if (startMins < endMins) {
    return nowMins >= startMins && nowMins < endMins;
  }
  return nowMins >= startMins || nowMins < endMins;
}

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg?.type === "zen-hush-get-rules") {
    const s = await getSettings();
    const dndActive = s.dndEnabled && isWithinDnd(s.dndStart, s.dndEnd);
    const muted = s.mutedSites.includes(msg.host);
    return { dndActive, muted };
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
