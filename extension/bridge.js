// Zen Hush — bridge (isolated world)
// inject.js runs in the page's MAIN world and has no access to `browser.*`.
// This script runs in the extension's isolated world, has full API access,
// and relays messages between the two via window.postMessage.

async function sendRules() {
  const rules = await browser.runtime.sendMessage({
    type: "zen-hush-get-rules",
    host: location.hostname,
  });
  window.postMessage({ channel: "zen-hush", type: "rules", rules }, "*");
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.channel !== "zen-hush") return;
  if (event.data.type === "request-rules") sendRules();
});

// Muting a site or changing the schedule takes effect in open tabs at once.
browser.storage.onChanged.addListener((_changes, area) => {
  if (area === "local") sendRules();
});
