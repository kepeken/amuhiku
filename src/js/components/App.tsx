import * as React from 'react';
import * as OTM from '../app/OTM/types';
import Modal from './Modal';
import * as Page from './Page';
import WordList from './WordListTSX';
import WordEditor from './WordEditorTSX';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Dictionary from '../app/Dictionary';
import './App.scss';

interface Props {
  dictionary: string;
}

export default class App extends React.Component<Props, {
  show: boolean;
  dictionary: Dictionary;
  currentWord: OTM.Word;
  select: ((entry: OTM.Entry) => void) | null;
}> {
  constructor(props: Props) {
    super(props);
    const dictionary = new Dictionary(this.props.dictionary);
    this.state = {
      show: false,
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
        <Page.List>
          <Page.Item>
            <Page.Header>
              <Page.Title></Page.Title>
            </Page.Header>
            <Page.Body>
              <WordList
                mode="edit"
                words={this.state.dictionary.words}
                onSelect={currentWord => this.setState({ show: true, currentWord })}
              />
            </Page.Body>
          </Page.Item>
        </Page.List>
        <div
          className="float-button"
          onClick={() => this.setState({ show: true, currentWord: this.state.dictionary.createWord() })}
        >
          <FontAwesomeIcon icon="plus" />
        </div>
        <Modal
          show={this.state.show}
          fullscreen
        >
          <WordEditor
            mode="edit"
            words={this.state.dictionary.words}
            word={this.state.currentWord}
            onCancel={() => this.setState({ show: false })}
            onEdit={word => {
              this.setState({ show: false, dictionary: this.state.dictionary.updateWord(word) });
            }}
            onRemove={id => {
              this.setState({ show: false, dictionary: this.state.dictionary.removeWord(id) });
            }}
          />
        </Modal>
      </>
    );
  }
}
