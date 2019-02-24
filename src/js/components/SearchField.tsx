import * as React from 'react';
import debounce = require('lodash/debounce');

interface Props {
  onChange: (value: string) => void;
}

interface State {
  value: string;
}

export default class SearchField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.emitChangeDebounced = debounce(this.emitChange, 250);
  }
  handleChange(event: React.FormEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;
    this.setState({
      value: target.value
    });
    this.emitChangeDebounced(target.value);
  }
  emitChange(value: string) {
    this.props.onChange(value);
  }
  emitChangeDebounced: (value: string) => void;
  render() {
    return (
      <input
        type="text"
        className="search-field"
        placeholder="Search"
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}
