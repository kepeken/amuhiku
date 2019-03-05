import * as React from 'react';
import * as OTM from '../app/OTM/types';
import Modal from './Modal';
import * as Page from './Page';
import WordList from './WordListTSX';
import WordEditor from './WordEditorTSX';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Dictionary from '../app/Dictionary';
import { CSSTransition } from 'react-transition-group';
import './App.scss';

interface Props {
  dictionary: string;
}

interface State {
  show: null | "menu" | "editor";
  dictionary: Dictionary;
  currentWord: OTM.Word;
  select: ((entry: OTM.Entry) => void) | null;
}

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const dictionary = new Dictionary(this.props.dictionary);
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
    };
  }

  render() {
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
              <div className="menu-list">
                <div
                  className="menu-item"
                  onClick={() => { }}
                >
                  <span className="menu-icon"><FontAwesomeIcon icon="plus" /></span>
                  新規辞書の作成
                </div>
                <div
                  className="menu-item"
                  onClick={() => { }}
                >
                  <span className="menu-icon"><FontAwesomeIcon icon="plus" /></span>
                  辞書を開く
                </div>
              </div>
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
        <Modal
          show={this.state.show === "editor"}
          fullscreen
        >
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
      </>
    );
  }
}
