import { escapeRegExp } from 'lodash-es';
import * as OTM from './types';

export type SearchOptions = {
  mode: "name" | "equivalent" | "content";
  type: "exact" | "part";
}

export default function compileWordTester(
  text: string,
  { mode, type }: SearchOptions
): (word: OTM.Word) => boolean {
  const matched = text.match(/\S+/g) as null | string[];
  if (!matched) {
    return () => true;
  }
  const and = new RegExp("^" + matched.map(p =>
    "(?=.*" + escapeRegExp(p) + ")"
  ).join(""), "i");
  if (mode === "name") {
    if (type === "exact") {
      return word => word.entry.form === text;
    } else {
      return word => and.test(word.entry.form);
    }
  } else if (mode === "equivalent") {
    if (type === "exact") {
      return word => word.translations.some(translation => translation.forms.indexOf(text) >= 0);
    } else {
      return word => word.translations.some(translation => and.test(translation.forms.join(" ")));
    }
  } else {
    if (type === "exact") {
      return word =>
        word.entry.form === text ||
        word.translations.some(translation => translation.forms.indexOf(text) >= 0) ||
        word.tags.indexOf(text) >= 0 ||
        word.contents.some(content => content.text === text) ||
        word.variations.some(variation => variation.form === text) ||
        word.relations.some(relation => relation.entry.form === text);
    } else {
      return word =>
        and.test(word.entry.form) ||
        word.translations.some(translation => and.test(translation.forms.join(" "))) ||
        and.test(word.tags.join(" ")) ||
        word.contents.some(content => and.test(content.text)) ||
        word.variations.some(variation => and.test(variation.form)) ||
        word.relations.some(relation => and.test(relation.entry.form));
    }
  }
}