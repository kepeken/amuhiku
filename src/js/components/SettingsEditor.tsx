import * as React from 'react';
import globalSettings, { settingsData, Settings } from '../app/globalSettings';

class SettingsEditor extends React.Component<{}, Settings> {
  constructor(props: {}) {
    super(props);
    this.state = settingsData;
  }
  setItem(key: keyof Settings) {
    return (event: React.ChangeEvent<HTMLSelectElement>) => {
      this.setState({
        [key]: event.target.value,
      });
      globalSettings.set(key, event.target.value);
    };
  }
  render() {
    return (
      <div>
        <h5>出力する JSON の整形：</h5>
        <select
          className="item clickable"
          value={this.state["prettify-json"]}
          onChange={this.setItem("prettify-json")}
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
