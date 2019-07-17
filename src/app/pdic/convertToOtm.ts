import * as PDIC from './types';
import * as OTM from '../OTM/types';

const convertToOtm = (source: PDIC.Dictionary): OTM.Dictionary => {
  return {
    words: source.words.map((word, index) => {
      return {
        entry: {
          id: index + 1,
          form: word.word,
        },
        translations: [],
        tags: [
          ...(word.memory ? [
            "暗記",
          ] : []),
          ...(word.modify ? [
            "修正",
          ] : []),
        ],
        contents: [
          ...(word.trans ? [
            {
              title: "訳語",
              text: word.trans,
            },
          ] : []),
          ...(word.exp ? [
            {
              title: "用例",
              text: word.exp,
            },
          ] : []),
          ...(word.level ? [
            {
              title: "レベル",
              text: `${word.level}`,
            },
          ] : []),
          ...(word.pron ? [
            {
              title: "発音",
              text: word.pron,
            },
          ] : []),
        ],
        variations: [],
        relations: [],
      };
    }),
  };
};

export default convertToOtm;
