const DEFAULTS = {
  dndEnabled: false,
  dndStart: "22:00",
  dndEnd: "07:00",
  mutedSites: [],
};

const dndEnabledEl = document.getElementById("dndEnabled");
const dndStartEl = document.getElementById("dndStart");
const dndEndEl = document.getElementById("dndEnd");
const muteCurrentEl = document.getElementById("muteCurrent");
const mutedListEl = document.getElementById("mutedList");

async function load() {
  const s = { ...DEFAULTS, ...(await browser.storage.local.get(DEFAULTS)) };
  dndEnabledEl.checked = s.dndEnabled;
  dndStartEl.value = s.dndStart;
  dndEndEl.value = s.dndEnd;
  renderMutedList(s.mutedSites);
}

function renderMutedList(sites) {
  mutedListEl.innerHTML = "";
  for (const host of sites) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = host;
    const btn = document.createElement("button");
    btn.textContent = "×";
    btn.addEventListener("click", async () => {
      await browser.runtime.sendMessage({ type: "zen-hush-unmute-site", host });
      load();
    });
    li.append(span, btn);
    mutedListEl.appendChild(li);
  }
}

dndEnabledEl.addEventListener("change", () =>
  browser.storage.local.set({ dndEnabled: dndEnabledEl.checked }),
);
dndStartEl.addEventListener("change", () =>
  browser.storage.local.set({ dndStart: dndStartEl.value }),
);
dndEndEl.addEventListener("change", () =>
  browser.storage.local.set({ dndEnd: dndEndEl.value }),
);

muteCurrentEl.addEventListener("click", async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;
  const host = new URL(tab.url).hostname;
  await browser.runtime.sendMessage({ type: "zen-hush-mute-site", host });
  load();
});

load();
