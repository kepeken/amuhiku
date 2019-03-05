import alertError from "../decorator/alertError";

class BrowserResourceHandler {

  @alertError
  dir(path) {
    return new Promise((resolve, reject) => {
      const entries = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key[0] === "/") {
          entries.push({
            isFolder: false,
            name: key.split("/").pop(),
            path: key
          });
        }
      }
      resolve(entries);
    });
  }

  @alertError
  read(path) {
    return new Promise((resolve, reject) => {
      resolve(localStorage.getItem(path));
    });
  }

  @alertError
  create(path, text) {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem(path) !== null) {
        throw new Error(`${path} は既に存在しています。`);
      }
      localStorage.setItem(path, text);
      resolve();
    });
  }

  @alertError
  update(path, text) {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem(path) === null) {
        throw new Error(`${path} は存在しません。`);
      }
      localStorage.setItem(path, text);
      resolve();
    });
  }

}

export default new BrowserResourceHandler();