import * as React from 'react';
import globalSettings, { Settings } from '../app/globalSettings';

class SettingsEditor extends React.Component<{}, Settings> {
  constructor(props: {}) {
    super(props);
    this.state = globalSettings.getAll();
  }
  setItem<K extends keyof Settings>(key: K, value: Settings[K]) {
    // ここの computed property name が勝手に string になるのはバグ？
    // https://github.com/Microsoft/TypeScript/issues/13948
    this.setState({
      [key]: value,
    } as Settings);
    globalSettings.set(key, value);
  }
  render() {
    return (
      <div>
        <h5>出力する JSON の整形：</h5>
        <select
          className="item clickable"
          value={this.state["prettify-json"] || ""}
          onChange={event => this.setItem("prettify-json", event.target.value || null)}
        >
          <option value="">整形しない</option>
          <option value="zpdic">ZpDIC 準拠</option>
          <option value="  ">スペース ×2</option>
          <option value="    ">スペース ×4</option>
          <option value="\t">タブ</option>
        </select>
      </div>
    );
  }
}

export default SettingsEditor;
