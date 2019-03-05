import { File, Folder } from './base';

class BrowserFile implements File {
  private readonly key: string;
  public readonly name: string;

  constructor(name: string) {
    this.key = `/${name}`;
    this.name = name;
  }

  async read() {
    const text = localStorage.getItem(this.key);
    if (text === null) {
      throw new Error("item not found");
    } else {
      return text;
    }
  }

  async update(text: string) {
    localStorage.setItem(this.key, text);
  }
}

class BrowserFolder implements Folder {
  public readonly name: string = "";

  async list() {
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key[0] === "/") {
        entries.push(new BrowserFile(key.slice(1)));
      }
    }
    return entries;
  }

  child(name: string) {
    return new BrowserFile(name);
  }

  async create(name: string, text: string) {
    const file = new BrowserFile(name);
    const result = await file.read();
    if (result === null) {
      throw new Error(`${name} は既に存在しています。`);
    } else {
      return file;
    }
  }
}

const root = new BrowserFolder();

export default root;
