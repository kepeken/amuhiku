class BrowserResourceHandler {

  dir(path) {
    return new Promise((resolve, reject) => {
      try {
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
      } catch (err) {
        reject(err);
      }
    });
  }

  read(path) {
    return new Promise((resolve, reject) => {
      try {
        resolve(localStorage.getItem(path));
      } catch (err) {
        reject(err);
      }
    });
  }

  create(path, text) {
    return new Promise((resolve, reject) => {
      try {
        if (localStorage.getItem(path) !== null) {
          throw new Error(`${path} は既に存在しています。`);
        }
        localStorage.setItem(path, text);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  update(path, text) {
    return new Promise((resolve, reject) => {
      try {
        if (localStorage.getItem(path) === null) {
          throw new Error(`${path} は存在しません。`);
        }
        localStorage.setItem(path, text);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

}

export default new BrowserResourceHandler();
