const resources = {
  browser: {
    id: "browser",
    name: `ブラウザストレージ`,
    api: require("./browser").default,
  },
  dropbox: {
    id: "dropbox",
    name: `Dropbox`,
    api: require("./dropbox").default,
  },
  github: {
    id: "github",
    name: `GitHub Gist`,
    api: require("./github").default,
  },
};


const loader = {
  $e: $("#loading").hide(),
  start() { this.$e.show(); },
  end() { this.$e.hide(); },
};


class Handler {
  constructor(resource, path, isFolder) {
    this.resource = resource;
    this.path = path;
    this.name = path.split("/").pop();
    this.isFolder = isFolder;
  }

  get loggedIn() {
    return this.resource.api.loggedIn;
  }

  logIn() {
    if (confirm(`${this.resource.name} にログインします。`)) {
      return this.resource.api.logIn().then(() => {
        alert(`ログインしました。`);
      }).catch(err => {
        alert(err);
      });
    } else {
      return Promise.reject(null);
    }
  }

  dir() {
    if (!this.isFolder) return Promise.reject();
    return this.resource.api.dir(this.path).then((res) => {
      return res.map(({ isFolder, path, name }) => {
        return new Handler(this.resource, path, isFolder);
      });
    });
  }

  read() {
    if (this.isFolder) return Promise.reject();
    return this.resource.api.read(this.path);
  }

  create(fileName, content) {
    if (!this.isFolder) return Promise.reject();
    let option;
    if (this.resource.id === "github") {
      option = {
        public: confirm("public にしますか？"),
      }
    }
    return this.resource.api.create(`${this.path}/${fileName}`, content, option);
  }

  update(content) {
    if (this.isFolder) return Promise.reject();
    return this.resource.api.update(this.path, content);
  }
}

export default {
  get(id) {
    return new Handler(resources[id], "", true);
  }
};
