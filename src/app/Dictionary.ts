import * as OTM from './OTM/types';
import * as validate from './OTM/validate';
import globalSettings, { Settings } from './globalSettings';
import jacksonPrettyPrint from '../util/jacksonPrettyPrint';
import cloneDeep = require('lodash/cloneDeep');

export default class Dictionary {
  private data: OTM.Dictionary;
  private changed: boolean;

  constructor(text?: string | OTM.Dictionary) {
    if (text === undefined) {
      this.data = {
        words: [],
      };
    } else if (typeof text === "string") {
      const data = JSON.parse(text);
      if (!validate.dictionary(data)) {
        throw new Error("OTM-JSON のフォーマットが正しくありません。");
      }
      this.data = data;
    } else {
      this.data = text;
    }
    this.changed = false;
    const idset = new Set();
    for (const { entry: { id } } of this.data.words) {
      if (idset.has(id)) {
        throw new Error("ID が重複しています。");
      }
      idset.add(id);
    }
  }

  get words() {
    return this.data.words;
  }

  nextId() {
    const ids = this.data.words.map(word => word.entry.id);
    return ids.length === 0 ? 0 : Math.max(...ids) + 1;
  }

  createWord() {
    const nextId = this.nextId();
    const { zpdic } = this.data;
    if (zpdic && zpdic.defaultWord) {
      const { defaultWord } = zpdic;
      if (validate.word(defaultWord)) {
        const word = cloneDeep(defaultWord);
        word.entry.id = nextId;
        return word;
      }
    }
    return {
      entry: { id: nextId, form: "" },
      translations: [],
      tags: [],
      contents: [],
      variations: [],
      relations: [],
    };
  }

  addWord(word: OTM.Word) {
    return new Dictionary({
      ...this.data,
      words: [...this.data.words, word],
    });
  }

  updateWord(newWord: OTM.Word) {
    const { words } = this.data;
    const index = words.findIndex(word => word.entry.id === newWord.entry.id);
    return new Dictionary({
      ...this.data,
      words: index >= 0 ? [...words.slice(0, index), newWord, ...words.slice(index + 1)] : [...words, newWord],
    });
  }

  removeWord(id: number) {
    return new Dictionary({
      ...this.data,
      words: this.data.words.filter(word => word.entry.id !== id),
    });
  }

  stringify(...args: [] | [Settings["prettify-json"]]) {
    const space = args.length === 1 ? args[0] : globalSettings.get("prettify-json");
    if (space === null) {
      return JSON.stringify(this.data);
    } else if (space === "zpdic") {
      return jacksonPrettyPrint(this.data);
    } else {
      if (/[^\x09\x0a\x0d\x20]/.test(space)) {
        // https://www.json.org/json-ja.html
        throw new Error(`"${space}" は無効なインデントです。`);
      }
      return JSON.stringify(this.data, null, space);
    }
  }
}
