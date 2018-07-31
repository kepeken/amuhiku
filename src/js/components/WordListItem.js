import m from "./hyperscript";

export default function WordListItem({ word, button }) {
  return m(".word-list-item", {}, [
    m(".word-list-item-header", {}, [
      button,
      m("h3.otm-entry-form", {}, [
        word.entry.form,
        " ",
        word.tags.map(tag => [
          m("span.otm-tag", {}, tag), " "
        ])
      ]),
    ]),
    m(".word-list-item-body", {}, [
      word.translations.map(translation =>
        m("div", {}, [
          m("span.otm-translation-title", {}, translation.title),
          translation.forms.map(form =>
            m("span.otm-translation-form", {}, form)
          ),
        ])
      ),
      word.contents.map(content =>
        m("div", {}, [
          m("div.otm-content-title", {}, content.title),
          m("div.otm-content-text", {}, content.text),
        ])
      ),
      word.variations.map(variation =>
        m("div", {}, [
          m("span.otm-variation-title", {}, variation.title),
          m("span.otm-variation-form", {}, variation.form),
        ])
      ),
      word.relations.map(relation =>
        m("div", {}, [
          m("span.otm-relation-title", {}, relation.title),
          // m("a.otm-relation-entry-form", { href: `#${rel.entry.id}` }, relation.entry.form),
          m("span.otm-relation-entry-form", {}, relation.entry.form),
        ])
      ),
    ]),
  ]);
}
