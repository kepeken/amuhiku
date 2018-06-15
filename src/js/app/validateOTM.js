// http://ja.conlinguistics.wikia.com/wiki/OTM-JSON

const string = x => typeof x === "string";
const integer = x => x | 0 === x;
const array = t => x => Array.isArray(x) && x.every(t);
const object = t => x => {
  if (typeof x !== "object" || !x) return false;
  for (const k in t) if (!t[k](x[k])) return false;
  return true;
};

const translation = object({ title: string, forms: array(string) });
const content = object({ title: string, text: string });
const variation = object({ title: string, form: string });
const relation = object({ title: string, entry: object({ id: integer, form: string }) });

const word = object({
  entry: object({ id: integer, form: string }),
  translations: array(translation),
  tags: array(string),
  contents: array(content),
  variations: array(variation),
  relations: array(relation)
});

export default object({
  words: array(word)
});

