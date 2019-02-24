export type Word = {
  entry: Entry;
  translations: Translation[];
  tags: Tag[];
  contents: Content[];
  variations: Variation[];
  relations: Relation[];
};

export type Entry = {
  id: number;
  form: string;
};

export type Translation = {
  title: string;
  forms: string[];
};

export type Tag = string;

export type Content = {
  title: string;
  text: string;
};

export type Variation = {
  title: string;
  form: string;
};

export type Relation = {
  title: string;
  entry: Entry;
};
