import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Page from './Page';
import globalSettings, { Settings } from '../app/globalSettings';
import './SettingsEditor.scss';

interface Props {
  onClose: () => void;
}

export default class SettingsEditor extends React.Component<Props, Settings> {
  constructor(props: Props) {
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
      <Page.List>
        <Page.Item>
          <Page.Header>
            <Page.Button onClick={this.props.onClose}><FontAwesomeIcon icon="times" /></Page.Button>
            <Page.Title>設定</Page.Title>
          </Page.Header>
          <Page.Body>
            <div className="settings">
              <h5 className="settings-key">出力する JSON の整形</h5>
              <select
                className="settings-value"
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
          </Page.Body>
        </Page.Item>
      </Page.List>
    );
  }
}
