import m from "./hyperscript";
import { pushPage, popPage } from "./pages";

import React from 'react';
import ReactDOM from 'react-dom';
import WordList from './WordListTSX';

export default function RelatedWordSelector({ dict, entry }) {
  let $id, $form;
  const wordList = document.createElement("div");
  ReactDOM.render(
    React.createElement(WordList, {
      words: dict.words,
      onSelect: (word) => {
        $id.value = word.entry.id;
        $form.value = word.entry.form;
        popPage();
      },
    }),
    wordList
  );
  const root = [
    $id = m("input", { name: `relations[][entry][id]`, type: "hidden" }),
    $form = m("input", {
      name: `relations[][entry][form]`,
      placeholder: `単語を選択`,
      readOnly: true,
      onclick() {
        this.blur();
        pushPage({
          header: `単語を選択`,
          content: wordList,
        });
      },
    }),
  ];
  if (entry) {
    $id.value = entry.id;
    $form.value = entry.form;
  }
  return root;
}
