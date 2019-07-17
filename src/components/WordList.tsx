import * as React from 'react';
import * as OTM from '../app/OTM/types';
import compileWordTester, { SearchOptions } from '../app/OTM/compileWordTester';
import SearchField from './SearchField';
import SearchOptionForm from './SearchOptionForm';
import WordListItem from './WordListItem';
import './WordList.scss';

interface Props {
  mode: "read" | "edit" | "select";
  words: OTM.Word[];
  onSelect: (word: OTM.Word) => void;
}

export default function WordList(props: Props) {
  const SIZE = 120;

  const [text, setText] = React.useState("");
  const [options, setOptions] = React.useState<SearchOptions>({ mode: "name", type: "exact" });
  const [results, setResults] = React.useState(props.words);
  const [limit, setLimit] = React.useState(SIZE);

  React.useEffect(() => {
    const test = compileWordTester(text, options);
    const found = props.words.filter(test);
    setResults(found);
    setLimit(SIZE);
  }, [text, options, props.words]);

  const rest = results.length - limit;
  const addition = Math.min(SIZE, rest);

  return (
    <div className="word-list">
      <SearchField
        text={text}
        onChange={setText}
      />
      <SearchOptionForm
        options={options}
        onChange={setOptions}
      />
      <div className="search-result">
        <div className="search-info">
          {results.length} / {props.words.length}
        </div>
        {results.slice(0, limit).map(word =>
          <WordListItem
            key={word.entry.id}
            mode={props.mode}
            word={word}
            onClick={props.onSelect}
          />
        )}
        {addition > 0 && (
          <button
            className="show-more"
            onClick={() => setLimit(limit + addition)}
          >
            次の {addition} 件を表示
          </button>
        )}
      </div>
    </div>
  );
}
