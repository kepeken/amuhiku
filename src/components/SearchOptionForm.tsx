import * as React from 'react';
import { SearchOptions } from '../app/OTM/compileWordTester';

interface Props {
  onChange: (options: SearchOptions) => void;
  options: SearchOptions;
}

export default function SearchOptionForm(props: Props) {
  const [mode, setMode] = React.useState<SearchOptions["mode"]>("name");
  const [type, setType] = React.useState<SearchOptions["type"]>("exact");

  React.useEffect(() => {
    props.onChange({ mode, type });
  }, [mode, type]);

  return (
    <div className="search-option">
      <div>
        <label>
          <input
            type="radio"
            checked={mode === "name"}
            onChange={() => setMode("name")}
          />
          単語
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "equivalent"}
            onChange={() => setMode("equivalent")}
          />
          訳語
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "content"}
            onChange={() => setMode("content")}
          />
          全文
        </label>
      </div>
      <div>
        <label>
          <input
            type="radio"
            checked={type === "exact"}
            onChange={() => setType("exact")}
          />
          完全一致
        </label>
        <label>
          <input
            type="radio"
            checked={type === "part"}
            onChange={() => setType("part")}
          />
          部分一致
        </label>
      </div>
    </div>
  );
}
