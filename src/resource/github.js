import NetlifyAuthProviders from "netlify-auth-providers";

class GitHubResourceHandler {

  constructor() {
    this.base = "https://api.github.com";
    this.netlifyAuth = new NetlifyAuthProviders({ site_id: "amuhiku.netlify.com" });
    this.loggedIn = false;
    this.token = null;
  }

  parse(path) {
    return {
      folder: path.split("/").slice(0, 3).join("/"),
      file: path.split("/")[3],
    };
  }

  logIn() {
    return new Promise((resolve, reject) => {
      this.netlifyAuth.authenticate({ provider: "github", scope: "gist" }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          this.loggedIn = true;
          this.token = res.token;
          resolve();
        }
      });
    });
  }

  request(input, init) {
    const url = new URL(input, this.base);
    const req = new Request(url, init);
    req.headers.set("Authorization", `token ${this.token}`);
    return fetch(req);
  }

  dir(path) {
    return this.request("/gists")
      .then(res => res.json())
      .then(res => {
        return res.map((gist) => {
          const name = Object.keys(gist.files)[0];
          return {
            isFolder: false,
            name: name,
            path: `/gists/${gist.id}/${name}`
          };
        });
      });
  }

  read(path) {
    path = this.parse(path).folder;
    return this.request(path)
      .then(res => res.json())
      .then(res => {
        const name = Object.keys(res.files)[0];
        return res.files[name].content;
      });
  }

  create(path, text, init = {}) {
    const files = {};
    files[path.split("/")[1]] = { content: text };
    return this.request("/gists", {
      method: "POST",
      body: JSON.stringify({
        files: files,
        public: init.public,
      }),
    }).then(res => res.json());
  }

  update(path, text) {
    const files = {};
    const p = this.parse(path);
    files[p.file] = { content: text };
    return this.request(p.folder, {
      method: "PATCH",
      body: JSON.stringify({
        files: files,
      }),
    }).then(res => res.json());
  }

}

export default new GitHubResourceHandler();
