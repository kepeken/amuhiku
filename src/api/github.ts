import * as API from './base';
import NetlifyAuthProviders from 'netlify-auth-providers';

class GitHubClient extends API.Client {
  private base = "https://api.github.com";
  private _loggedIn = false;
  private netlifyAuth = new NetlifyAuthProviders({ site_id: "amuhiku.netlify.com" });
  private token = "";

  get loggedIn() {
    return this._loggedIn;
  }

  async logIn() {
    return new Promise<void>((resolve, reject) => {
      this.netlifyAuth.authenticate({ provider: "github", scope: "gist" }, (err: any, res: any) => {
        if (err) {
          reject(err);
        } else {
          this._loggedIn = true;
          this.token = res.token;
          resolve();
        }
      });
    });
  }

  async request(input: string, init?: RequestInit) {
    const url = new URL(input, this.base);
    const req = new Request(url.href, init);
    req.headers.set("Authorization", `token ${this.token}`);
    return fetch(req).then(res => res.json());
  }
}

class GitHubFile extends API.File {
  private client: GitHubClient;
  private id: string;
  public readonly path: string;
  public readonly name: string;

  constructor(client: GitHubClient, id: string, name: string) {
    super();
    this.client = client;
    this.id = id;
    this.path = `/gists/${id}/${name}`;
    this.name = name;
  }

  async read() {
    const result = await this.client.request(this.path);
    const name = Object.keys(result.files)[0];
    return result.files[name].content;
  }

  async update(text: string) {
    const files = {
      [this.name]: { content: text },
    };
    return this.client.request(`/gists/${this.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        files,
      }),
    });
  }
}

class GitHubFolder extends API.Folder {
  private client: GitHubClient;
  public readonly path: string;
  public readonly name: string;

  constructor(client: GitHubClient) {
    super();
    this.client = client;
    this.path = "/gists";
    this.name = "gists";
  }

  async list() {
    const result = await this.client.request("/gists");
    return result.map((gist: any) => {
      const name = Object.keys(gist.files)[0];
      return new GitHubFile(this.client, gist.id, name);
    });
  }

  async create(name: string, text: string, init: { public: boolean }) {
    const files = {
      [name]: { content: text },
    };
    const res = await this.client.request("/gists", {
      method: "POST",
      body: JSON.stringify({
        files,
        public: init.public,
      }),
    });
    return new GitHubFile(this.client, res.id, name);
  }
}
