import * as React from 'react';
import debounce = require('lodash/debounce');

interface Props {
  text: string;
  onChange: (text: string) => void;
}

interface State {
  text: string;
}

export default class SearchField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      text: props.text,
    };
    this.handleChange = this.handleChange.bind(this);
    this.emitChangeDebounced = debounce(this.emitChange, 250);
  }
  handleChange(event: React.FormEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;
    this.setState({
      text: target.value
    });
    this.emitChangeDebounced(target.value);
  }
  emitChange(text: string) {
    this.props.onChange(text);
  }
  emitChangeDebounced: (text: string) => void;
  render() {
    return (
      <input
        type="text"
        className="search-field"
        placeholder="Search"
        value={this.state.text}
        onChange={this.handleChange}
      />
    );
  }
}
