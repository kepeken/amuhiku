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
import * as misc from '../api/misc';
import './App.scss';

interface Props { }

interface State {
  show: null | "menu" | "editor" | "files" | "settings";
  dictionary: Dictionary;
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
        }
      }
    } catch (e) {
      alert(e);
    }
    this.state = {
      show: null,
      dictionary,
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
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.dictionary !== prevState.dictionary) {
      localStorage.setItem("temp", this.state.dictionary.stringify(null));
    }
  }

  render() {
    const CloseButton = () => (
      <Page.Button onClick={() => this.setState({ show: null })}><FontAwesomeIcon icon="times" /></Page.Button>
    );
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
                <List.Item onClick={() => this.setState({ show: null, dictionary: new Dictionary() })}>
                  <List.Icon><FontAwesomeIcon icon="plus" /></List.Icon>
                  <List.Text>新規辞書の作成</List.Text>
                </List.Item>
                <List.Item onClick={() => this.setState({ show: "files" })}>
                  <List.Icon><FontAwesomeIcon icon="plus" /></List.Icon>
                  <List.Text>辞書を開く</List.Text>
                </List.Item>
                <List.Item onClick={() => this.setState({ show: "settings" })}>
                  <List.Icon><FontAwesomeIcon icon="cog" /></List.Icon>
                  <List.Text>設定</List.Text>
                </List.Item>
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
                <Page.Title></Page.Title>
              </Page.Header>
              <Page.Body>
                <WordList
                  mode="edit"
                  words={this.state.dictionary.words}
                  onSelect={currentWord => this.setState({ show: "editor", currentWord })}
                />
              </Page.Body>
            </Page.Item>
          </Page.List>
          <div
            className="float-button"
            onClick={() => this.setState({ show: "editor", currentWord: this.state.dictionary.createWord() })}
          >
            <FontAwesomeIcon icon="plus" />
          </div>
        </div>
        <Modal fullscreen show={this.state.show === "editor"}>
          <WordEditor
            mode="edit"
            words={this.state.dictionary.words}
            word={this.state.currentWord}
            onCancel={() => this.setState({ show: null })}
            onEdit={word => {
              this.setState({ show: null, dictionary: this.state.dictionary.updateWord(word) });
            }}
            onRemove={id => {
              this.setState({ show: null, dictionary: this.state.dictionary.removeWord(id) });
            }}
          />
        </Modal>
        <Modal fullscreen show={this.state.show === "files"}>
          <FilePicker
            onCancel={() => this.setState({ show: null })}
            onSelect={text => this.setState({ show: null, dictionary: new Dictionary(text) })}
          />
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
