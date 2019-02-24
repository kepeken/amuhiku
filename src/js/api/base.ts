export interface File {
  readonly name: string;
  read(): Promise<string | null>;
  update(text: string): Promise<void>;
}

export interface Folder {
  readonly name: string;
  list(): Promise<(File | Folder)[]>;
  child(name: string): File;
  create(name: string, text: string): Promise<File>;
}
