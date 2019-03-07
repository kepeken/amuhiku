import * as API from './base';
import { Dropbox } from 'dropbox';
import readAsText from '../util/readAsText';

class DropboxClient extends API.Client {
  private _loggedIn = false;
  private client = new Dropbox({ clientId: "rtid7yv8kjr94tc" });

  get loggedIn() {
    return this._loggedIn;
  }

  private setAccessToken(accessToken: string) {
    this._loggedIn = true;
    this.client = new Dropbox({ accessToken });
  }

  async logIn() {
    return new Promise<void>((resolve, reject) => {
      const redirectUri = `${location.origin}/dropbox.html`;
      const authUrl = this.client.getAuthenticationUrl(redirectUri);
      const authWindow = window.open(authUrl, undefined, "width=640,height=480");
      if (authWindow === null) {
        reject(new Error("ポップアップがブロックされました。"));
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

class DropboxFile extends API.File {
  private client: Dropbox;
  public readonly path: string;
  public readonly name: string;

  constructor(client: Dropbox, parent: string, name: string) {
    super();
    this.client = client;
    this.path = `${parent}/${name}`;
    this.name = name;
  }

  async read() {
    const result = await this.client.filesDownload({ path: this.path });
    // Dropbox SDK の不備により FileMetadata.fileBlob の型定義が抜けているため矯正
    const blob = (result as any).fileBlob as Blob;
    return readAsText(blob);
  }

  async update(text: string) {
    await this.client.filesUpload({
      path: this.path,
      contents: new Blob([text], { type: "application/json" }),
      mode: { ".tag": "overwrite" },
    });
  }
}

class DropboxFolder extends API.Folder {
  private client: Dropbox;
  public readonly path: string;
  public readonly name: string;

  constructor(client: Dropbox, parent: string, name: string) {
    super();
    this.client = client;
    this.path = `${parent}/${name}`;
    this.name = name;
  }

  async list() {
    const result = await this.client.filesListFolder({ path: this.path });
    const entries = [];
    for (const entry of result.entries) {
      if (entry[".tag"] === "file") {
        entries.push(new DropboxFile(this.client, this.path, entry.name));
      } else if (entry[".tag"] === "folder") {
        entries.push(new DropboxFolder(this.client, this.path, entry.name));
      }
    }
    return entries;
  }

  async create(name: string, text: string) {
    await this.client.filesUpload({
      path: `${this.path}/${name}`,
      contents: new Blob([text], { type: "application/json" }),
      mode: { ".tag": "add" },
    });
    return new DropboxFile(this.client, this.path, name);
  }
}
