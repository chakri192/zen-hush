// Zen Hush — inject (MAIN world)
// Wraps the page's real `Notification` constructor so pages that are muted,
// or that fire during a scheduled quiet-hours window, get a no-op instead
// of a real system notification. Falls back to the real thing otherwise.

(() => {
  const OriginalNotification = window.Notification;
  if (!OriginalNotification) return;

  // The schedule itself (not a yes/no answer) is sent over, so the quiet-hours
  // check happens at the moment each notification is created -- a tab opened
  // before quiet hours still goes quiet once they start. The bridge pushes a
  // fresh copy whenever the settings change.
  let rules = null;
  // Notifications fired before the first rules arrive are parked here, then
  // shown or dropped once we know whether to suppress them.
  const pending = [];

  function minutes(hhmm) {
    const [h, m] = String(hhmm).split(":").map(Number);
    return h * 60 + m;
  }

  // Handles overnight ranges (e.g. 22:00 -> 07:00) as well as same-day ranges.
  function inQuietHours(r) {
    if (!r.dndEnabled || r.dndStart === r.dndEnd) return false;
    const start = minutes(r.dndStart);
    const end = minutes(r.dndEnd);
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    return start < end ? cur >= start && cur < end : cur >= start || cur < end;
  }

  function suppressed() {
    return rules.muted || inQuietHours(rules);
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data?.channel !== "zen-hush") return;
    if (event.data.type !== "rules") return;
    const firstLoad = rules === null;
    rules = event.data.rules;
    if (firstLoad) {
      const suppress = suppressed();
      for (const held of pending.splice(0)) {
        if (held._closed || suppress) continue;
        held._materialise();
      }
    }
  });

  window.postMessage({ channel: "zen-hush", type: "request-rules" }, "*");

  const HANDLERS = ["onclick", "onshow", "onclose", "onerror"];

  class ZenHushNotification {
    constructor(title, options) {
      this._title = title;
      this._options = options || {};
      this._closed = false;
      this._real = null;
      this._handlers = {};
      this._listeners = [];

      if (rules === null) {
        // Unknown yet: park it. When rules arrive it's either dropped or shown.
        pending.push(this);
        return;
      }
      if (!suppressed()) this._materialise();
      // Suppressed: stay an inert stand-in with the same shape, so page
      // scripts that touch `.onclick`, `.close()`, etc. don't throw.
    }

    // Create the real notification and hand it everything the page attached
    // to the stand-in, so click handlers still work on notifications that
    // were queued at startup.
    _materialise() {
      this._real = new OriginalNotification(this._title, this._options);
      for (const name of HANDLERS) {
        if (this._handlers[name]) this._real[name] = this._handlers[name];
      }
      for (const [type, fn, opts] of this._listeners) {
        this._real.addEventListener(type, fn, opts);
      }
    }

    close() {
      this._closed = true; // if still parked, this stops it from being shown
      this._real?.close();
    }
    addEventListener(type, fn, opts) {
      this._listeners.push([type, fn, opts]);
      this._real?.addEventListener(type, fn, opts);
    }
    removeEventListener(type, fn, opts) {
      this._listeners = this._listeners.filter(([t, f]) => !(t === type && f === fn));
      this._real?.removeEventListener(type, fn, opts);
    }
    get title() { return this._title; }
    get body() { return this._options.body ?? ""; }
    get icon() { return this._options.icon ?? ""; }
    get tag() { return this._options.tag ?? ""; }
    get data() { return this._options.data ?? null; }
  }

  for (const name of HANDLERS) {
    Object.defineProperty(ZenHushNotification.prototype, name, {
      get() { return this._handlers[name] ?? null; },
      set(fn) {
        this._handlers[name] = fn;
        if (this._real) this._real[name] = fn;
      },
    });
  }

  ZenHushNotification.requestPermission =
    OriginalNotification.requestPermission.bind(OriginalNotification);
  Object.defineProperty(ZenHushNotification, "permission", {
    get: () => OriginalNotification.permission,
  });
  Object.defineProperty(ZenHushNotification, "maxActions", {
    get: () => OriginalNotification.maxActions,
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
