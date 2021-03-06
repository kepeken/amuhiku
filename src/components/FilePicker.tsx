import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Page from './Page';
import * as List from './List';
import Loader from './Loader';
import * as OTM from '../app/OTM/types';
import * as API from '../api/base';
import browser from '../api/browser';
import dropboxClient from '../api/dropbox';
import githubClient from '../api/github';
import * as misc from '../api/misc';
import helpData from '../data/help.json';

interface Props {
  mode: "open" | "save";
  onCancel: () => void;
  onOpen?: (content: string | OTM.Dictionary, file: API.File | File | URL | null) => void;
  onSave?: (update: (content: string) => Promise<API.File>) => void;
}

interface State {
  pages: {
    title: string;
    folder: API.Folder;
    items: (API.File | API.Folder)[];
  }[];
  loading: boolean;
  browser: API.Folder;
  dropbox: API.Folder | null;
  github: API.Folder | null;
}

export default class FilePicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pages: [],
      loading: false,
      browser,
      dropbox: dropboxClient.root,
      github: githubClient.root,
    };
    this.handlePop = this.handlePop.bind(this);
  }

  handlePop() {
    this.setState({ pages: this.state.pages.slice(0, -1) });
  }

  async handleLogIn(name: "dropbox" | "github", client: API.Client) {
    let root = this.state[name];
    if (root === null) {
      alert("ログインします。");
      root = await client.logIn();
      this.setState({
        [name]: root,
      } as Pick<State, typeof name>);
      alert("ログインしました。");
    }
    return root;
  }

  async handleList(folder: API.Folder) {
    this.setState({ loading: true });
    const entries = await folder.list();
    this.setState({
      pages: [
        ...this.state.pages,
        {
          title: folder.name,
          folder,
          items: entries,
        },
      ],
      loading: false,
    });
  }

  async handleSelect(file: API.File) {
    if (this.props.mode === "open") {
      if (!this.props.onOpen) return;
      this.setState({ loading: true });
      const content = await file.read();
      this.setState({ loading: false });
      this.props.onOpen && this.props.onOpen(content, file);
    } else {
      if (!this.props.onSave) return;
      if (confirm(`${file.path} は既に存在しています。上書きしますか？`)) {
        this.setState({ loading: true });
        this.props.onSave(async content => {
          await file.update(content);
          this.setState({ loading: false });
          alert("上書きしました。");
          return file;
        });
      }
    }
  }

  async handleCreate(folder: API.Folder, items: (API.File | API.Folder)[]) {
    if (!this.props.onSave) return;
    const name = prompt("ファイル名を入力", ".json");
    if (!name) return;
    if (/[\\\/:,;*?"<>|]/.test(name)) {
      alert("使えない文字が含まれています。");
      return;
    }
    const found = items.find(function (entry): entry is API.File { return entry instanceof API.File && entry.name === name; })
    if (found) {
      this.handleSelect(found);
    } else {
      this.props.onSave(async content => {
        const file = await folder.create(name, content);
        this.setState({ loading: false });
        alert(`${file.path} を作成しました。`);
        return file;
      });
    }
  }

  async handleImportFromDevice() {
    if (!this.props.onOpen) return;
    const { file, text } = await misc.importFromDevice();
    this.props.onOpen(text, file);
  }

  async handleImportByURL() {
    if (!this.props.onOpen) return;
    try {
      const url = prompt(`JSON ファイルの URL を指定してください。\n・http: か https: で始まっていること\n・CORS に対応していること`);
      if (url) {
        const content = await misc.importByURL(url);
        // const newURL = new URL(location.href);
        // newURL.search = new URLSearchParams({ r: url }).toString();
        // history.replaceState(null, "", newURL.toString());
        this.props.onOpen(content, new URL(url));
      }
    } catch (e) {
      alert(e);
    }
  }

  render() {
    return (
      <>
        <Page.List>
          <Page.Item>
            <Page.Header>
              <Page.Button onClick={this.props.onCancel}>
                <FontAwesomeIcon icon="times" />
              </Page.Button>
              <Page.Title>{this.props.mode === "open" ? "辞書を開く" : "名前をつけて保存"}</Page.Title>
            </Page.Header>
            <Page.Body>
              <List.List>
                <List.Item onClick={() => this.handleList(this.state.browser)}>
                  <List.Icon><FontAwesomeIcon icon="folder" /></List.Icon>
                  <List.Text>ブラウザストレージ</List.Text>
                </List.Item>
                <List.Item onClick={async () => this.handleList(await this.handleLogIn("dropbox", dropboxClient))}>
                  <List.Icon><FontAwesomeIcon icon={["fab", "dropbox"]} /></List.Icon>
                  <List.Text>Dropbox</List.Text>
                </List.Item>
                <List.Item onClick={async () => this.handleList(await this.handleLogIn("github", githubClient))}>
                  <List.Icon><FontAwesomeIcon icon={["fab", "github"]} /></List.Icon>
                  <List.Text>GitHub Gist</List.Text>
                </List.Item>
                {this.props.mode === "open" && <>
                  <List.Item onClick={() => this.handleImportFromDevice()}>
                    <List.Icon><FontAwesomeIcon icon="desktop" /></List.Icon>
                    <List.Text>ローカルファイル</List.Text>
                  </List.Item>
                  <List.Item onClick={() => this.handleImportByURL()}>
                    <List.Icon><FontAwesomeIcon icon="globe" /></List.Icon>
                    <List.Text>URL を指定して読み込む</List.Text>
                  </List.Item>
                  <List.Item onClick={() => this.props.onOpen && this.props.onOpen(helpData, null)}>
                    <List.Icon><FontAwesomeIcon icon="question-circle" /></List.Icon>
                    <List.Text>サンプルデータ</List.Text>
                  </List.Item>
                </>}
              </List.List>
            </Page.Body>
          </Page.Item>
          {this.state.pages.map(({ title, folder, items }, idx) =>
            <Page.Item key={idx}>
              <Page.Header>
                <Page.Button onClick={this.handlePop}>
                  <FontAwesomeIcon icon="chevron-left" />
                </Page.Button>
                <Page.Title>{title}</Page.Title>
              </Page.Header>
              <Page.Body>
                <List.List>
                  {items.map((entry, idx) =>
                    entry instanceof API.Folder
                      ?
                      <List.Item key={idx} onClick={() => this.handleList(entry)}>
                        <List.Icon><FontAwesomeIcon icon="folder" /></List.Icon>
                        <List.Text>{entry.name}</List.Text>
                      </List.Item>
                      :
                      <List.Item key={idx} onClick={() => this.handleSelect(entry)}>
                        <List.Icon><FontAwesomeIcon icon="file" /></List.Icon>
                        <List.Text>{entry.name}</List.Text>
                      </List.Item>
                  )}
                  {this.props.mode === "save" && (
                    <List.Item key="new" onClick={() => this.handleCreate(folder, items)}>
                      <List.Icon><FontAwesomeIcon icon="plus" /></List.Icon>
                      <List.Text>新しいファイルとして保存</List.Text>
                    </List.Item>
                  )}
                </List.List>
              </Page.Body>
            </Page.Item>
          )}
        </Page.List>
        <Loader show={this.state.loading} />
      </>
    );
  }
}
