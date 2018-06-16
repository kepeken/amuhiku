import m from "./hyperscript";
// import collectFormData from "../util/collectFormData";
import escapeRegExp from "../util/escapeRegExp";
// import uniqid from "../util/uniqid";

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
export function WordEditor(word, punctuations) {
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
    PropEditor(word.translations, ($) => [
      m("input", { name: `translations[][title]`, value: $ && $.title }),
      m("input", { name: `translations[][forms]`, value: $ && $.forms.join(punct) }),
    ]),
    m("hr"),
    m("h4", {}, "タグ"),
    PropEditor(word.tags, ($) => [
      m("input", { name: `tags[]`, value: $ }),
    ]),
    m("hr"),
    m("h4", {}, "内容"),
    PropEditor(word.contents, ($) => [
      m("input", { name: `contents[][title]`, value: $ && $.title, placeholder: "" }),
      m("textarea", { name: `contents[][text]`, value: $ && $.text, placeholder: "" })
    ]),
    m("hr"),
    m("h4", {}, "変化形"),
    PropEditor(word.variations, ($) => [
      m("input", { name: `variations[][title]`, value: $ && $.title, placeholder: "説明", }),
      m("input", { name: `variations[][form]`, value: $ && $.form, placeholder: "綴り", })
    ]),
    m("hr"),
    m("h4", {}, "関連語"),
    PropEditor(word.relations, ($) => [
      m("input", { name: `relations[][title]`, value: $ && $.title, placeholder: "説明" }),
      m("input", { name: `relations[][entry][id]`, value: $ && $.entry.id, placeholder: "ID" }),
      m("input", { name: `relations[][entry][form]`, value: $ && $.entry.form, placeholder: "単語" }),
    ]),
  ]);
}

/**
 * @param {HTMLElement} root
 * @param {string[]} punctuations
 */
export function collectFromWordEditor(root, punctuations) {
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
  // const word = collectFormData(root);
  // for (const name of ["translations", "tags", "contents", "variations", "relations"]) {
  //   console.log(word, name);
  //   word[name] = word[name] ? Object.values(word[name]) : [];
  // }
  // word.entry.id |= 0;
  // word.translations.forEach(translation => {
  //   translation.forms = translation.forms.split(punct);
  // });
  // word.relations.forEach(relation => {
  //   relation.entry.id |= 0;
  // });
  // return word;
}
