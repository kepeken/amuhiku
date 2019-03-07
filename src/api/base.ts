export abstract class Entry {
  abstract readonly name: string;
}

export abstract class File extends Entry {
  abstract read(): Promise<string>;
  abstract update(text: string): Promise<void>;
}

export abstract class Folder extends Entry {
  abstract list(): Promise<(File | Folder)[]>;
  abstract child(name: string): File;
  abstract create(name: string, text: string): Promise<File>;
}
