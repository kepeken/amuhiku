import * as React from 'react';

interface Props {
  onChange: (state: State) => void;
}

interface State {
  mode: "name" | "equivalent" | "content";
  type: "exact" | "part";
}

export default class SearchOptionForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mode: "name",
      type: "exact"
    };
  }
  handleChange<K extends keyof State>(newState: Pick<State, K>) {
    this.setState(newState);
    this.props.onChange(Object.assign({}, this.state, newState));
  }
  render() {
    const { mode, type } = this.state;
    return (
      <div
        className="search-option"
      >
        <div>
          <label>
            <input
              type="radio"
              checked={mode === "name"}
              onChange={() => this.handleChange({ mode: "name" })}
            />
            単語
          </label>
          <label>
            <input
              type="radio"
              checked={mode === "equivalent"}
              onChange={() => this.handleChange({ mode: "equivalent" })}
            />
            訳語
          </label>
          <label>
            <input
              type="radio"
              checked={mode === "content"}
              onChange={() => this.handleChange({ mode: "content" })}
            />
            全文
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              checked={type === "exact"}
              onChange={() => this.handleChange({ type: "exact" })}
            />
            完全一致
          </label>
          <label>
            <input
              type="radio"
              checked={type === "part"}
              onChange={() => this.handleChange({ type: "part" })}
            />
            部分一致
          </label>
        </div>
      </div>
    );
  }
}
