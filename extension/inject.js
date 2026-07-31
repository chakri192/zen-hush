// Zen Hush — inject (MAIN world)
// Wraps the page's real `Notification` constructor so pages that are muted,
// or that fire during a scheduled quiet-hours window, get a no-op instead
// of a real system notification. Falls back to the real thing otherwise.

(() => {
  const OriginalNotification = window.Notification;
  if (!OriginalNotification) return;

  let rules = { dndActive: false, muted: false };
  let rulesLoaded = false;
  // Notifications fired before the async rules round-trip returns are parked
  // here, then flushed once we actually know whether to suppress them --
  // otherwise anything fired in that sub-second window always slipped through.
  const pending = [];

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data?.channel !== "zen-hush") return;
    if (event.data.type === "rules") {
      rules = event.data.rules;
      const firstLoad = !rulesLoaded;
      rulesLoaded = true;
      if (firstLoad) {
        const suppress = rules.dndActive || rules.muted;
        for (const held of pending.splice(0)) {
          if (held._closed) continue;
          // Only materialise the real notification if rules allow it.
          if (!suppress) held._real = new OriginalNotification(held._title, held._options);
        }
      }
    }
  });

  window.postMessage({ channel: "zen-hush", type: "request-rules" }, "*");

  class ZenHushNotification {
    constructor(title, options) {
      this._title = title;
      this._options = options || {};
      this._closed = false;

      if (!rulesLoaded) {
        // Unknown yet: park it. When rules arrive it's either dropped or fired.
        pending.push(this);
        return;
      }

      this._suppressed = rules.dndActive || rules.muted;
      if (!this._suppressed) {
        this._real = new OriginalNotification(title, options);
        return this._real;
      }
      // Suppressed: return an inert stand-in with the same shape so page
      // scripts that touch `.onclick`, `.close()`, etc. don't throw.
    }

    close() {
      this._closed = true;  // if still parked, this stops it from firing on flush
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
