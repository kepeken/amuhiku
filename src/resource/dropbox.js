import { Dropbox } from "dropbox";
import readAsText from "../util/readAsText";
import load from "../decorator/load";
import alertError from "../decorator/alertError";

class DropboxResourceHandler {

  constructor() {
    this.loggedIn = false;
    this.client = new Dropbox({ clientId: "rtid7yv8kjr94tc" });
  }

  setAccessToken(accessToken) {
    this.loggedIn = true;
    this.client = new Dropbox({ accessToken });
  };

  @alertError
  logIn() {
    return new Promise((resolve, reject) => {
      const redirectUri = `${location.origin}/dropbox.html`;
      const authUrl = this.client.getAuthenticationUrl(redirectUri);
      const callback = (event) => {
        if (event.source !== authWindow) return;
        if (event.origin !== location.origin) return;
        const params = new URLSearchParams(authWindow.location.hash.slice(1));
        authWindow.history.replaceState(null, null, "#");
        const accessToken = params.get("access_token");
        if (accessToken) {
          this.setAccessToken(accessToken);
          resolve();
        }
        window.removeEventListener("message", callback, false);
        authWindow.close();
      };
      window.addEventListener("message", callback, false);
      const authWindow = window.open(authUrl, null, "width=640,height=480");
    });
  }

  @load
  @alertError
  dir(path) {
    return this.client.filesListFolder({ path })
      .then((result) => {
        return result.entries.filter((entry) => {
          return entry[".tag"] === "folder" || entry[".tag"] === "file";
        }).map((entry) => {
          return {
            isFolder: entry[".tag"] === "folder",
            name: entry.name,
            path: entry.path_display
          };
        });
      });
  }

  @load
  @alertError
  read(path) {
    return this.client.filesDownload({ path })
      .then(result => result.fileBlob)
      .then(readAsText);
  }

  @load
  @alertError
  create(path, text) {
    return this.client.filesUpload({
      path,
      contents: new Blob([text], { type: "application/json" }),
      mode: { ".tag": "add" },
    });
  }

  @load
  @alertError
  update(path, text) {
    return this.client.filesUpload({
      path,
      contents: new Blob([text], { type: "application/json" }),
      mode: { ".tag": "overwrite" },
    });
  }

}

export default new DropboxResourceHandler();
