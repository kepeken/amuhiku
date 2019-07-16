export type Dictionary = {
  words: Word[];
};

export type Word = {
  keyword?: string;
  word: string;
  trans?: string;
  exp?: string;
  level?: number;
  memory?: boolean;
  modify?: boolean;
  pron?: string;
};
