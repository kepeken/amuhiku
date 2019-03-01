import * as React from 'react';
import * as OTM from '../app/OTM/types';
import uniqueId = require('lodash/uniqueId');
import cloneDeep = require('lodash/cloneDeep');
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  word: OTM.Word;
  onEdit: (word: OTM.Word) => void;
  onCancel: () => void;
  onRemove: () => void;
  onSelect: () => Promise<OTM.Entry>;
}

type Keyed<T> = [string, T];

interface State {
  entryForm: string;
  translations: Keyed<OTM.Translation>[];
  tags: Keyed<OTM.Tag>[];
  contents: Keyed<OTM.Content>[];
  variations: Keyed<OTM.Variation>[];
  relations: Keyed<OTM.Relation>[];
}

const PropEditor = <T extends {}>(props: {
  title: string,
  items: Keyed<T>[],
  defaultItem: T;
  onChange: (items: Keyed<T>[]) => void;
  children: (item: T, update: (item: T) => void) => React.ReactNode,
}) => {
  const updateFactory = (key: string) => (item: T) => {
    props.onChange(props.items.map(entry => entry[0] === key ? [entry[0], item] as Keyed<T> : entry));
  };
  return (
    <div className="prop-editor">
      <div className="prop-title">{props.title}</div>
      {props.items.map(([key, item], i) => [
        i !== 0 && (
          <div key={`swapper-${i}`}>
            <button onClick={() => props.onChange([...props.items.slice(0, i - 1), props.items[i], props.items[i - 1], ...props.items.slice(i + 1)])}>
              <FontAwesomeIcon icon="long-arrow-alt-up" />
              <FontAwesomeIcon icon="long-arrow-alt-down" />
            </button>
          </div>
        ),
        <div key={key}>
          {props.children(item, updateFactory(key))}
          <button onClick={() => props.onChange(props.items.filter(([k, _]) => k !== key))}>
            <FontAwesomeIcon icon="trash-alt" />
          </button>
        </div>
      ])}
      <button onClick={() => props.onChange([...props.items, [uniqueId(), cloneDeep(props.defaultItem)]])}>
        <FontAwesomeIcon icon="plus" />
      </button>
    </div>
  );
};

const withKey = <T extends {}>(item: T) => [uniqueId(), item] as Keyed<T>;

export default class WordEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      entryForm: props.word.entry.form,
      translations: props.word.translations.map(withKey),
      tags: props.word.tags.map(withKey),
      contents: props.word.contents.map(withKey),
      variations: props.word.variations.map(withKey),
      relations: props.word.relations.map(withKey),
    };
  }
  render() {
    return (
      <div>
        <input
          value={this.state.entryForm}
          onChange={event => this.setState({ entryForm: event.target.value })}
        />
        <PropEditor
          title="内容"
          items={this.state.contents}
          defaultItem={{ title: "", text: "" }}
          onChange={contents => this.setState({ contents })}
        >
          {(content, update) => (
            <div>
              <input
                value={content.title}
                onChange={e => update({ ...content, title: e.target.value })}
              />
              <textarea
                value={content.text}
                onChange={e => update({ ...content, text: e.target.value })}
              />
            </div>
          )}
        </PropEditor>
      </div>
    );
  }
}
