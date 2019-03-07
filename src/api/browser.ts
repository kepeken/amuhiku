import * as API from './base';

class BrowserFile extends API.File {
  public readonly path: string;
  public readonly name: string;

  constructor(name: string) {
    super();
    this.path = `/${name}`;
    this.name = name;
  }

  async read() {
    const text = localStorage.getItem(this.path);
    if (text === null) {
      throw new Error(`${this.name} は存在しません。`);
    } else {
      return text;
    }
  }

  async update(text: string) {
    localStorage.setItem(this.path, text);
  }
}

class BrowserFolder extends API.Folder {
  public readonly path = "";
  public readonly name = "";

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

  async create(name: string, text: string) {
    const file = new BrowserFile(name);
    if (localStorage.getItem(file.path) !== null) {
      throw new Error(`${name} は既に存在しています。`);
    }
    localStorage.setItem(file.path, text);
    return file;
  }
}

export default new BrowserFolder();
