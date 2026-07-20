// Zen Hush — bridge (isolated world)
// inject.js runs in the page's MAIN world and has no access to `browser.*`.
// This script runs in the extension's isolated world, has full API access,
// and relays messages between the two via window.postMessage.

window.addEventListener("message", async (event) => {
  if (event.source !== window) return;
  if (event.data?.channel !== "zen-hush") return;

  if (event.data.type === "request-rules") {
    const rules = await browser.runtime.sendMessage({
      type: "zen-hush-get-rules",
      host: location.hostname,
    });
    window.postMessage({ channel: "zen-hush", type: "rules", rules }, "*");
  }
});
