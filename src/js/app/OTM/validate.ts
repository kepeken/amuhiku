import * as OTM from './types';

function string(x: any): x is string {
  return typeof x === "string";
}

function integer(x: any): x is number {
  return (x | 0) === x;
}

function array<T>(t: (x: any) => x is T) {
  return function (x: any): x is T[] {
    return Array.isArray(x) && x.every(t);
  };
}

function object<T>(t: { [K in keyof T]: (x: any) => x is T[K] }) {
  return function (x: any): x is T {
    if (typeof x !== "object" || !x) return false;
    for (const k in t) if (!t[k](x[k])) return false;
    return true;
  };
}

const entry = object<OTM.Entry>({
  id: integer,
  form: string,
});

const translation = object<OTM.Translation>({
  title: string,
  forms: array(string),
});

const tag = string;

const content = object<OTM.Content>({
  title: string,
  text: string,
});

const variation = object<OTM.Variation>({
  title: string,
  form: string,
});

const relation = object<OTM.Relation>({
  title: string,
  entry: entry,
});

const word = object<OTM.Word>({
  entry: entry,
  translations: array(translation),
  tags: array(tag),
  contents: array(content),
  variations: array(variation),
  relations: array(relation),
});

export default object({
  words: array(word),
});
