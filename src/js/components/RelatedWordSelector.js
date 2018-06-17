import m from "./hyperscript";
import { pushPage, popPage } from "./pages";
import WordList from "./WordList";


export default function RelatedWordSelector({ dict, entry }) {
  let $id, $form;
  function buttonFactory({ word }) {
    return m("span.edit.clickable", {
      onclick() {
        $id.value = word.entry.id;
        $form.value = word.entry.form;
        popPage();
      }
    },
      m("i.fas.fa-check")
    );
  }
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
          content: WordList({ dict, buttonFactory }),
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
