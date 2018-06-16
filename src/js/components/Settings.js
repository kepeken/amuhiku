import app from "../app";
import m from "./hyperscript";

export default class Settings {
  render() {
    return [
      m(".settings", {}, [
        m("h5", {}, "出力する JSON の整形："),
        m("select.item.clickable", {
          value: app.globalSettings.get("prettify-json") || "",
          onchange() {
            app.globalSettings.set("prettify-json", this.value || null);
          },
        }, [
            m("option", { value: "", text: "整形しない" }),
            m("option", { value: "zpdic", text: "ZpDIC 準拠" }),
            m("option", { value: "  ", text: "スペース ×2" }),
            m("option", { value: "    ", text: "スペース ×4" }),
            m("option", { value: "\t", text: "タブ" }),
          ]),
      ])
    ];
  }
}
