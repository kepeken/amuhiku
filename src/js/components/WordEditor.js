import m from "./hyperscript";
import { escapeRegExp } from "../util";

function ItemSwapper() {
  return m(".item-swapper.clickable", {
    onclick() {
      const parent = this.parentNode;
      parent.parentNode.insertBefore(parent, parent.previousElementSibling);
    }
  }, [
      m("i.fas.fa-long-arrow-alt-up"),
      m("i.fas.fa-long-arrow-alt-down"),
    ]);
}

function ItemDeleter() {
  return m(".item-deleter.clickable", {
    onclick() {
      if (confirm("削除します")) {
        const parent = this.parentNode;
        parent.parentNode.removeChild(parent);
      }
    }
  },
    m("i.fas.fa-trash-alt")
  );
}

function ItemAdder(factory) {
  return m(".item-adder.clickable", {
    onclick() {
      this.parentNode.insertBefore(factory(null), this);
    }
  },
    m("i.fas.fa-plus")
  );
}

/**
 * @param {any[]} data
 * @param {Function} view
 */
function PropEditor(data, view) {
  const factory = data =>
    m("div", {}, [
      ItemSwapper(),
      ItemDeleter(),
      view(data),
    ]);
  return m("div", {}, [
    data.map(factory),
    ItemAdder(factory),
  ]);
}

/**
 * @param {Object} word
 * @param {string[]} punctuations
 */
export default function WordEditor(word, punctuations) {
  let punct = punctuations[0];
  if (punct === ",") punct += " ";
  return m(".word-editor", {}, [
    m("h4", {}, "単語"),
    m(".entry", {}, [
      m("input", { type: "hidden", name: "entry[id]", value: word.entry.id }),
      m("input", { name: "entry[form]", value: word.entry.form, placeholder: "見出し語" }),
      m("span.entry-id", {}, `#${word.entry.id}`),
    ]),
    m("hr"),
    m("h4", {}, "訳語"),
    PropEditor(word.translations, ($item) => [
      m("input", { name: `translations[][title]`, value: $item && $item.title, placeholder: "品詞など" }),
      m("input", { name: `translations[][forms]`, value: $item && $item.forms.join(punct), placeholder: "訳語" }),
    ]),
    m("hr"),
    m("h4", {}, "タグ"),
    PropEditor(word.tags, ($item) => [
      m("input", { name: `tags[]`, value: $item, placeholder: "" }),
    ]),
    m("hr"),
    m("h4", {}, "内容"),
    PropEditor(word.contents, ($item) => [
      m("input", { name: `contents[][title]`, value: $item && $item.title, placeholder: "タイトル" }),
      m("textarea", { name: `contents[][text]`, value: $item && $item.text, placeholder: "内容" }),
    ]),
    m("hr"),
    m("h4", {}, "変化形"),
    PropEditor(word.variations, ($item) => [
      m("input", { name: `variations[][title]`, value: $item && $item.title, placeholder: "説明" }),
      m("input", { name: `variations[][form]`, value: $item && $item.form, placeholder: "綴り" }),
    ]),
    m("hr"),
    m("h4", {}, "関連語"),
    PropEditor(word.relations, ($item) => [
      m("input", { name: `relations[][title]`, value: $item && $item.title, placeholder: "説明" }),
      m("input", { name: `relations[][entry][id]`, value: $item && $item.entry.id, placeholder: "ID" }),
      m("input", { name: `relations[][entry][form]`, value: $item && $item.entry.form, placeholder: "単語" }),
    ]),
  ]);
}

/**
 * @param {HTMLElement} root
 * @param {string[]} punctuations
 */
WordEditor.collect = function (root, punctuations) {
  const punct = new RegExp(punctuations.map(p => `\\s*${escapeRegExp(p)}\\s*`).join("|") + "|\\n+");
  const word = {
    entry: { id: 0, form: "" },
    translations: [],
    tags: [],
    contents: [],
    variations: [],
    relations: []
  };
  function last(arr) {
    return arr[arr.length - 1];
  }
  const actions = {
    "entry[id]":
      $value => word.entry.id = $value | 0,
    "entry[form]":
      $value => word.entry.form = $value,
    "translations[][title]":
      $value => word.translations.push({ title: $value }),
    "translations[][forms]":
      $value => last(word.translations).forms = $value.split(punct),
    "tags[]":
      $value => word.tags.push($value),
    "contents[][title]":
      $value => word.contents.push({ title: $value }),
    "contents[][text]":
      $value => last(word.contents).text = $value,
    "variations[][title]":
      $value => word.variations.push({ title: $value }),
    "variations[][form]":
      $value => last(word.variations).form = $value,
    "relations[][title]":
      $value => word.relations.push({ title: $value }),
    "relations[][entry][id]":
      $value => last(word.relations).entry = { id: $value | 0 },
    "relations[][entry][form]":
      $value => last(word.relations).entry.form = $value,
  }
  for (const input of root.querySelectorAll("[name]")) {
    actions[input.name] && actions[input.name](input.value);
  }
  return word;
}
