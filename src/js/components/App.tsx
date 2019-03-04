import * as React from 'react';
import * as OTM from '../app/OTM/types';
import Modal from './Modal';
import WordList from './WordListTSX';
import WordEditor from './WordEditorTSX';

interface Props {
  dictionary: OTM.Dictionary;
}

export default class App extends React.Component<Props, {
  show: boolean;
  currentWord: OTM.Word;
  select: ((entry: OTM.Entry) => void) | null;
}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      show: false,
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
      <div>
        <WordList
          mode="edit"
          words={this.props.dictionary.words}
          onSelect={currentWord => this.setState({ show: true, currentWord })}
        />
        <Modal
          show={this.state.show}
          fullscreen
        >
          <WordEditor
            mode="edit"
            words={this.props.dictionary.words}
            word={this.state.currentWord}
            onCancel={() => this.setState({ show: false })}
            onEdit={() => { }}
            onRemove={() => { }}
          />
        </Modal>
      </div>
    );
  }
}
