import * as React from 'react';
import * as OTM from '../app/OTM/types';
import { CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from './Modal';
import * as Page from './Page';
import * as List from './List';
import WordList from './WordList';
import WordEditor from './WordEditor';
import FilePicker from './FilePicker';
import SettingsEditor from './SettingsEditor';
import Loader from './Loader';
import Dictionary from '../app/Dictionary';
import * as API from '../api/base';
import * as misc from '../api/misc';
import execCopy from '../util/execCopy';
import './App.scss';

interface Props { }

interface State {
  show: null | "menu" | "editor" | "opener" | "saver" | "export" | "settings";
  file: API.File | URL | null;
  dictionary: Dictionary;
  changed: boolean;
  currentWord: OTM.Word;
  select: ((entry: OTM.Entry) => void) | null;
  loading: boolean;
}

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    let loading = false;
    // @ts-ignore
    let dictionary = new Dictionary(require("../data/help"));
    let changed = false;
    try {
      const params = new URLSearchParams(location.search);
      const receivedURL = params.get("r");
      if (receivedURL) {
        loading = true;
        misc.importByURL(receivedURL).then(text => {
          this.setState({
            loading: false,
            dictionary: new Dictionary(text),
          });
        }).catch(e => {
          alert(e);
          this.setState({ loading: false });
        });
      } else {
        const temp = localStorage.getItem("temp");
        if (temp) {
          dictionary = new Dictionary(temp);
          changed = true;
        }
      }
    } catch (e) {
      alert(e);
    }
    this.state = {
      show: null,
      file: null,
      dictionary,
      changed,
      currentWord: {
        entry: { id: 0, form: "" },
        translations: [],
        tags: [],
        contents: [],
        variations: [],
        relations: [],
      },
      select: null,
      loading,
    };
    this.handleCreateDictionary = this.handleCreateDictionary.bind(this);
    this.handleUpdateDictionary = this.handleUpdateDictionary.bind(this);
    this.handleUpdateWord = this.handleUpdateWord.bind(this);
    this.handleRemoveWord = this.handleRemoveWord.bind(this);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.dictionary !== prevState.dictionary) {
      localStorage.setItem("temp", this.state.dictionary.stringify(null));
      const newURL = new URL(location.href);
      if (this.state.file instanceof URL) {
        newURL.search = new URLSearchParams({ r: this.state.file.href }).toString();
      } else {
        newURL.search = "";
      }
      history.replaceState(null, "", newURL.toString());
    }
  }

  confirm() {
    if (this.state.changed) {
      return confirm("注：ファイルが変更されています。新しいファイルを開くと変更は破棄されます。");
    } else {
      return true;
    }
  }

  handleCreateDictionary() {
    if (!this.confirm()) return;
    this.setState({
      show: null,
      file: null,
      dictionary: new Dictionary(),
      changed: false,
    });
  }

  async handleUpdateDictionary() {
    const { file, dictionary } = this.state;
    if (file instanceof API.File) {
      if (confirm(`${file.path} に現在のデータを上書きします。`)) {
        try {
          await file.update(dictionary.stringify());
          alert("保存しました。");
        } catch (e) {
          alert(e);
        }
        this.setState({
          show: null,
          changed: false,
        });
      }
    } else {
      alert("保存先がありません。");
    }
  }

  handleUpdateWord(word: OTM.Word) {
    this.setState(({ dictionary }) => ({
      show: null,
      dictionary: dictionary.updateWord(word),
      changed: true,
    }));
  }

  handleRemoveWord(id: number) {
    this.setState(({ dictionary }) => ({
      show: null,
      dictionary: dictionary.removeWord(id),
      changed: true,
    }));
  }

  render() {
    const CloseButton = () => (
      <Page.Button onClick={() => this.setState({ show: null })}><FontAwesomeIcon icon="times" /></Page.Button>
    );
    const { file, dictionary } = this.state;
    const pageTitle
      = file instanceof API.File ? file.name
        : file instanceof URL ? file.pathname.split("/").pop()
          : null;
    return (
      <>
        <CSSTransition
          in={this.state.show === "menu"}
          classNames="menu"
          timeout={300}
        >
          <div className="menu-wrapper">
            <div className="menu-back"
              onClick={() => this.setState({ show: null })}
            />
            <div className="menu-container">
              <div className="menu-header">
              </div>
              <List.List>
                <List.Item onClick={this.handleCreateDictionary}>
                  <List.Icon><FontAwesomeIcon icon="plus" /></List.Icon>
                  <List.Text>新規辞書の作成</List.Text>
                </List.Item>
                <List.Item onClick={() => this.confirm() && this.setState({ show: "opener" })}>
                  <List.Icon><FontAwesomeIcon icon="folder-open" /></List.Icon>
                  <List.Text>辞書を開く</List.Text>
                </List.Item>
                <List.Item onClick={this.handleUpdateDictionary}>
                  <List.Icon><FontAwesomeIcon icon="save" /></List.Icon>
                  <List.Text>上書き保存</List.Text>
                </List.Item>
                <List.Item onClick={() => this.setState({ show: "saver" })}>
                  <List.Icon><FontAwesomeIcon icon="save" /></List.Icon>
                  <List.Text>名前をつけて保存</List.Text>
                </List.Item>
                <List.Item onClick={() => this.setState({ show: "export" })}>
                  <List.Icon><FontAwesomeIcon icon="file-export" /></List.Icon>
                  <List.Text>エクスポート</List.Text>
                </List.Item>
                <List.Item onClick={() => this.setState({ show: "settings" })}>
                  <List.Icon><FontAwesomeIcon icon="cog" /></List.Icon>
                  <List.Text>設定</List.Text>
                </List.Item>
                <List.LinkItem href="https://kepeken.github.io/amuhiku/">
                  <List.Icon><FontAwesomeIcon icon="question-circle" /></List.Icon>
                  <List.Text>ヘルプページ</List.Text>
                </List.LinkItem>
              </List.List>
            </div>
          </div>
        </CSSTransition>
        <div className="app-content">
          <Page.List>
            <Page.Item>
              <Page.Header>
                <Page.Button
                  className="menu-button"
                  onClick={() => {
                    this.setState({ show: this.state.show === "menu" ? null : "menu" })
                  }}
                >
                  <FontAwesomeIcon icon="bars" />
                </Page.Button>
                <Page.Title>{pageTitle}</Page.Title>
              </Page.Header>
              <Page.Body>
                <WordList
                  mode="edit"
                  words={dictionary.words}
                  onSelect={currentWord => this.setState({ show: "editor", currentWord })}
                />
              </Page.Body>
            </Page.Item>
          </Page.List>
          <div
            className="float-button"
            onClick={() => this.setState({ show: "editor", currentWord: dictionary.createWord() })}
          >
            <FontAwesomeIcon icon="plus" />
          </div>
        </div>
        <Modal fullscreen show={this.state.show === "editor"}>
          <WordEditor
            mode="edit"
            words={dictionary.words}
            word={this.state.currentWord}
            onCancel={() => this.setState({ show: null })}
            onEdit={this.handleUpdateWord}
            onRemove={this.handleRemoveWord}
          />
        </Modal>
        <Modal fullscreen show={this.state.show === "opener"}>
          <FilePicker
            mode="open"
            onCancel={() => this.setState({ show: null })}
            onOpen={(text, file) => this.setState({ show: null, file, dictionary: new Dictionary(text), changed: false })}
          />
        </Modal>
        <Modal fullscreen show={this.state.show === "saver"}>
          <FilePicker
            mode="save"
            onCancel={() => this.setState({ show: null })}
            onSave={async update => this.setState({ show: null, file: await update(dictionary.stringify()), changed: false })}
          />
        </Modal>
        <Modal fullscreen show={this.state.show === "export"}>
          <Page.List>
            <Page.Item>
              <Page.Header>
                <CloseButton />
                <Page.Title>エクスポート</Page.Title>
              </Page.Header>
              <Page.Body>
                <List.List>
                  <List.Item key="0" onClick={() => {
                    misc.exportAsFile(dictionary.stringify(), { type: "text/plain" });
                  }}>
                    <List.Icon><FontAwesomeIcon icon="download" /></List.Icon>
                    <List.Text>ファイル出力（テキスト）</List.Text>
                  </List.Item>
                  <List.Item key="1" onClick={() => {
                    misc.exportAsFile(dictionary.stringify(), { type: "application/json;" });
                  }}>
                    <List.Icon><FontAwesomeIcon icon="download" /></List.Icon>
                    <List.Text>ファイル出力（バイナリ）</List.Text>
                  </List.Item>
                  <List.Item key="2" onClick={() => {
                    execCopy(dictionary.stringify())
                      .then(() => alert("コピーしました。"))
                      .catch(err => alert(err));
                  }}>
                    <List.Icon><FontAwesomeIcon icon="clipboard" /></List.Icon>
                    <List.Text>クリップボードにコピー</List.Text>
                  </List.Item>
                </List.List>
              </Page.Body>
            </Page.Item>
          </Page.List>
        </Modal>
        <Modal fullscreen show={this.state.show === "settings"}>
          <Page.List>
            <Page.Item>
              <Page.Header>
                <CloseButton />
                <Page.Title>設定</Page.Title>
              </Page.Header>
              <Page.Body>
                <SettingsEditor />
              </Page.Body>
            </Page.Item>
          </Page.List>
        </Modal>
        <Loader show={this.state.loading} />
      </>
    );
  }
}
