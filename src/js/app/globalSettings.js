localStorage.setItem("v", "20180308");

const defaultSettingsData = {
  "prettify-json": null
};

const settingsData = Object.assign(
  defaultSettingsData,
  JSON.parse(localStorage.getItem("settings"))
);

export default {
  set: (k, v) => {
    settingsData[k] = v;
    localStorage.setItem("settings", JSON.stringify(settingsData));
  },
  get: (k) => {
    return settingsData[k];
  }
}
