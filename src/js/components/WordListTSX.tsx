import * as React from 'react';
import * as OTM from '../app/OTM/types';
import compileWordTester, { SearchOptions } from '../app/OTM/compileWordTester';
import SearchField from './SearchField';
import SearchOptionForm from './SearchOptionForm';
import WordListItem from './WordListItemTSX';
import './WordList.scss';

interface Props {
  mode: "edit" | "select";
  words: OTM.Word[];
  onSelect: (word: OTM.Word) => void;
}

interface State {
  text: string;
  options: SearchOptions;
  results: OTM.Word[];
  limit: number;
}

export default class WordList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const defaultText = "";
    const defaultOptions = { mode: "name", type: "exact" } as SearchOptions;
    this.state = {
      text: defaultText,
      options: defaultOptions,
      results: this.findWords(defaultText, defaultOptions),
      limit: 120,
    };
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
  }

  handleTextChange(text: string) {
    const results = this.findWords(text, this.state.options);
    this.setState({ text, results, limit: 120 });
  }

  handleOptionsChange(options: SearchOptions) {
    const results = this.findWords(this.state.text, options);
    this.setState({ options, results, limit: 120 });
  }

  findWords(text: string, options: SearchOptions) {
    const test = compileWordTester(text, options);
    const found = this.props.words.filter(test);
    return found;
  }

  append() {
    const newLimit = Math.min(
      this.state.results.length,
      this.state.limit + 120
    );
    this.setState({ limit: newLimit });
  }

  render() {
    const rest = this.state.results.length - this.state.limit;
    return (
      <div className="word-list">
        <SearchField
          text={this.state.text}
          onChange={this.handleTextChange}
        />
        <SearchOptionForm
          options={this.state.options}
          onChange={this.handleOptionsChange}
        />
        <div className="search-result">
          <div className="search-info">
            {this.state.results.length} / {this.props.words.length}
          </div>
          {this.state.results.slice(0, this.state.limit).map(word =>
            <WordListItem
              key={word.entry.id}
              mode={this.props.mode}
              word={word}
              onClick={(word) => this.props.onSelect(word)}
            />
          )}
          {this.state.limit < this.state.results.length && (
            <button
              className="show-more"
              onClick={this.append.bind(this)}
            >
              次の {Math.min(120, rest)} 件を表示
            </button>
          )}
        </div>
      </div>
    );
  }
}
