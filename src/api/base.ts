export abstract class Client {
  abstract readonly loggedIn: boolean;
  abstract logIn(): Promise<Folder>;
}

abstract class Entry {
  abstract readonly name: string;
  abstract readonly path: string;
}

export abstract class File extends Entry {
  abstract read(): Promise<string>;
  abstract update(text: string): Promise<void>;
}

export abstract class Folder extends Entry {
  abstract list(): Promise<(File | Folder)[]>;
  abstract create(name: string, text: string, init: {}): Promise<File>;
}
