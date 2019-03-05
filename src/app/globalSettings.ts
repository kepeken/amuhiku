localStorage.setItem("v", "20180308");

type Settings = {
  // 今のところ null | "zpdic" | "  " | "    " | "\t" に限られるはず
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
  get<K extends keyof Settings>(k: K) {
    return settingsData[k] as Readonly<Settings[K]>;
  },
  getAll() {
    return settingsData as Readonly<Settings>;
  },
};

export {
  Settings,
};
