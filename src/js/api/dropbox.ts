import { File, Folder } from './base';
import { Dropbox } from 'dropbox';
import readAsText from '../util/readAsText';

class DropboxClient {
  private client: Dropbox;
  private _loggedIn: boolean;

  constructor() {
    this._loggedIn = false;
    this.client = new Dropbox({ clientId: "rtid7yv8kjr94tc" });
  }

  get loggedIn() {
    return this._loggedIn;
  }

  setAccessToken(accessToken: string) {
    this._loggedIn = true;
    this.client = new Dropbox({ accessToken });
  }

  async logIn() {
    return new Promise((resolve, reject) => {
      const redirectUri = `${location.origin}/dropbox.html`;
      const authUrl = this.client.getAuthenticationUrl(redirectUri);
      const authWindow = window.open(authUrl, undefined, "width=640,height=480");
      if (authWindow === null) {
        reject(new Error("could not open a window"));
        return;
      }
      const callback = (event: MessageEvent) => {
        if (event.source !== authWindow) return;
        if (event.origin !== location.origin) return;
        const params = new URLSearchParams(authWindow.location.hash.slice(1));
        authWindow.history.replaceState(null, "", "#");
        const accessToken = params.get("access_token");
        if (accessToken) {
          this.setAccessToken(accessToken);
          resolve();
        }
        window.removeEventListener("message", callback, false);
        authWindow.close();
      };
      window.addEventListener("message", callback, false);
    });
  }
}

class DropboxFile implements File {
  private client: Dropbox;
  private path: string;
  public readonly name: string;

  constructor(client: Dropbox, parent: string, name: string) {
    this.client = client;
    this.path = `${parent}/${name}`;
    this.name = name;
  }

  async read() {
    return this.client.filesDownload({ path: this.path })
      // Dropbox SDK の不備により FileMetadata.fileBlob の型定義が抜けているため矯正
      .then((result: any) => result.fileBlob as Blob)
      .then(readAsText);
  }

  async update(text: string) {
    return this.client.filesUpload({
      path: this.path,
      contents: new Blob([text], { type: "application/json" }),
      mode: { ".tag": "overwrite" },
    }).then(() => { });
  }
}

class DropboxFolder implements Folder {
  private client: Dropbox;
  private path: string;
  public readonly name: string;

  constructor(client: Dropbox, parent: string, name: string) {
    this.client = client;
    this.path = `${parent}/${name}`;
    this.name = name;
  }

  async list() {
    return this.client.filesListFolder({ path: this.path })
      .then(result => {
        const entries = [];
        for (const entry of result.entries) {
          if (entry[".tag"] === "file") {
            entries.push(new DropboxFile(this.client, this.path, entry.name));
          } else if (entry[".tag"] === "folder") {
            entries.push(new DropboxFolder(this.client, this.path, entry.name));
          }
        }
        return entries;
      });
  }

  child(name: string) {
    return new DropboxFile(this.client, this.path, name);
  }

  async create(name: string, text: string) {
    const file = new DropboxFile(this.client, this.path, name);
    return this.client.filesUpload({
      path: `${this.path}/${name}`,
      contents: new Blob([text], { type: "application/json" }),
      mode: { ".tag": "add" },
    }).then(() => file);
  }
}
