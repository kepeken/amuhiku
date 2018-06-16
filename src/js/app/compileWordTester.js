import { escapeRegExp } from "../util";

export default function compileWordTester(str, { mode, type } = {}) {
  const none = () => true;
  const m = str.match(/\S+/g);
  if (!m) return none;
  const and = new RegExp("^" + m.map(p =>
    // p[0] === "-" ? "(?!.*" + escapeRegExp(p.substr(1)) + ")" :
    "(?=.*" + escapeRegExp(p) + ")"
  ).join(""), "i");
  // const or = new RegExp(m.map(escapeRegExp).join("|"), "i");
  if (mode === "name") {
    if (type === "exact") return word => word.entry.form === str;
    if (type === "part") return word => and.test(word.entry.form);
  } else if (mode === "equivalent") {
    if (type === "exact") return word => word.translations.some(translation => translation.forms.includes(str));
    if (type === "part") return word => word.translations.some(translation => and.test(translation.forms.join(" ")));
  } else {
    if (type === "exact") return word => {
      return word.entry.form === str ||
        word.translations.some(translation => translation.forms.includes(str)) ||
        word.tags.includes(str) ||
        word.contents.some(content => content.text === str) ||
        word.variations.some(variation => variation.form === str) ||
        word.relations.some(relation => relation.entry.form === str);
    };
    return word => {
      return and.test(word.entry.form) ||
        word.translations.some(translation => and.test(translation.forms.join(" "))) ||
        and.test(word.tags.join(" ")) ||
        word.contents.some(content => and.test(content.text)) ||
        word.variations.some(variation => and.test(variation.form)) ||
        word.relations.some(relation => and.test(relation.entry.form));
    }
  }
}
