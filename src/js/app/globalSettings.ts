localStorage.setItem("v", "20180308");

type Settings = {
  "prettify-json": null | string;
};

const defaultSettingsData: Settings = {
  "prettify-json": null,
};

const stored = localStorage.getItem("settings");

const settingsData = Object.assign(
  defaultSettingsData,
  stored ? JSON.parse(stored) as Settings : null
);

export default {
  set<K extends keyof Settings>(k: K, v: Settings[K]) {
    settingsData[k] = v;
    localStorage.setItem("settings", JSON.stringify(settingsData));
  },
  get(k: keyof Settings) {
    return settingsData[k];
  }
};

export {
  settingsData,
  Settings,
};
