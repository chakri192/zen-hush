// Zen Hush — inject (MAIN world)
// Wraps the page's real `Notification` constructor so pages that are muted,
// or that fire during a scheduled quiet-hours window, get a no-op instead
// of a real system notification. Falls back to the real thing otherwise.

(() => {
  const OriginalNotification = window.Notification;
  if (!OriginalNotification) return;

  let rules = { dndActive: false, muted: false };
  let rulesLoaded = false;

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data?.channel !== "zen-hush") return;
    if (event.data.type === "rules") {
      rules = event.data.rules;
      rulesLoaded = true;
    }
  });

  window.postMessage({ channel: "zen-hush", type: "request-rules" }, "*");

  class ZenHushNotification {
    constructor(title, options) {
      this._title = title;
      this._options = options || {};
      this._suppressed = rules.dndActive || rules.muted;

      if (!this._suppressed) {
        this._real = new OriginalNotification(title, options);
        return this._real;
      }
      // Suppressed: return an inert stand-in with the same shape so page
      // scripts that touch `.onclick`, `.close()`, etc. don't throw.
    }

    close() {
      this._real?.close();
    }
    addEventListener() {}
    removeEventListener() {}
    get onclick() {
      return this._real?.onclick ?? null;
    }
    set onclick(_) {}
    get onshow() {
      return this._real?.onshow ?? null;
    }
    set onshow(_) {}
  }

  ZenHushNotification.requestPermission =
    OriginalNotification.requestPermission.bind(OriginalNotification);
  Object.defineProperty(ZenHushNotification, "permission", {
    get: () => OriginalNotification.permission,
  });

  try {
    Object.defineProperty(window, "Notification", {
      value: ZenHushNotification,
      writable: false,
      configurable: true,
    });
  } catch (e) {
    // Some pages may have already frozen window.Notification; nothing to do.
  }
})();
