import * as React from 'react';
import { debounce } from 'lodash-es';

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
    this.emitChangeDebounced = debounce(this.emitChange, 250);
  }

  handleChange(text: string) {
    this.setState({
      text,
    });
    this.emitChangeDebounced(text);
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
        onChange={e => this.handleChange(e.target.value)}
      />
    );
  }
}
