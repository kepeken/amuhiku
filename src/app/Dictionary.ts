import * as OTM from './OTM/types';
import * as validate from './OTM/validate';
import globalSettings, { Settings } from './globalSettings';
import jacksonPrettyPrint from '../util/jacksonPrettyPrint';
import { cloneDeep } from 'lodash-es';

export default class Dictionary {
  private data: OTM.Dictionary;
  public readonly detectedIndent: null | string;

  constructor(text?: string | OTM.Dictionary) {
    if (text === undefined) {
      this.data = {
        words: [],
      };
      this.detectedIndent = null;
    } else if (typeof text === "string") {
      const data = JSON.parse(text);
      if (!validate.dictionary(data)) {
        throw new Error("OTM-JSON のフォーマットが正しくありません。");
      }
      this.data = data;
      this.detectedIndent = Dictionary.detectIndent(text);
    } else {
      this.data = text;
      this.detectedIndent = null;
    }
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
    return ids.length === 0 ? 1 : Math.max(...ids) + 1;
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

  static detectIndent(text: string) {
    const re = /[\x09\x0a\x0d\x20]*"words"[\x09\x0a\x0d\x20]*:[\x09\x0a\x0d\x20]*\[[\x09\x0a\x0d\x20]*/;
    const res = re.exec(text);
    if (res) {
      const match = res[0];
      if (match.includes(`\n  "words" : [ `)) {
        return "zpdic";
      }
      if (match.includes(`\n    "words": [`)) {
        return "    ";
      }
      if (match.includes(`\n  "words": [`)) {
        return "  ";
      }
      if (match.includes(`\n\t"words": [`)) {
        return "\t";
      }
    }
    return null;
  }

  preview() {
    return jacksonPrettyPrint({ ...this.data, words: null })
      .replace(`"words" : null`, `"words" : Array(${this.data.words.length})`);
  }
}
