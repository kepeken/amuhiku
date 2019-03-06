import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as OTM from '../app/OTM/types';

interface Props {
  mode: "edit" | "select";
  word: OTM.Word;
  onClick: (word: OTM.Word) => void;
}

export default function WordListItem(props: Props) {
  const { word } = props;
  return (
    <div className="word-list-item">
      <div className="word-list-item-header">
        <button
          className="btn-select-item"
          onClick={() => props.onClick(word)}
        >
          {props.mode === "edit"
            ? <FontAwesomeIcon icon="edit" />
            : <FontAwesomeIcon icon="check" />
          }
        </button>
        <h3 className="otm-entry-form">
          {word.entry.form}
          {word.tags.map((tag, idx) =>
            <span key={idx} className="otm-tag">{tag}</span>
          )}
        </h3>
      </div>
      <div className="word-list-item-body">
        {word.translations.map((translation, idx) =>
          <div key={idx}>
            <span className="otm-translation-title">{translation.title}</span>
            {translation.forms.map((form, idx) =>
              <span key={idx} className="otm-translation-form">{form}</span>
            )}
          </div>
        )}
        {word.contents.map((content, idx) =>
          <div key={idx}>
            <div className="otm-content-title">{content.title}</div>
            <div className="otm-content-text">{content.text}</div>
          </div>
        )}
        {word.variations.map((variation, idx) =>
          <div key={idx}>
            <span className="otm-variation-title">{variation.title}</span>
            <span className="otm-variation-form">{variation.form}</span>
          </div>
        )}
        {word.relations.map((relation, idx) =>
          <div key={idx}>
            <span className="otm-relation-title">{relation.title}</span>
            <span className="otm-relation-entry">{relation.entry.form}</span>
          </div>
        )}
      </div>
    </div>
  );
}
