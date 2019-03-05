import React from 'react';
import ReactDOM from 'react-dom';

import './icons';

import {
  execCopy,
  jacksonPrettyPrint,
} from "./util";

import app from "./app";

import resourceHandler from "./resource/all";
const browser = resourceHandler.get("browser");
const dropbox = resourceHandler.get("dropbox");
const github = resourceHandler.get("github");

import device from "./resource/device";

import { pushPage } from "./components/pages";

var m = function (tag, attrs, children) {
  var e = typeof tag === "string" ? document.createElement(tag) : tag;
  var pname = { "class": "className", "data": "dataset" };
  if (attrs) for (var n in attrs) {
    var p = pname[n] || n;
    if (n === "style" || n === "data") {
      for (var k in attrs[n]) e[p][k] = attrs[n][k];
    } else {
      e[p] = attrs[n];
    }
  }
  function append(x) {
    if (Array.isArray(x)) {
      x.forEach(append);
    } else if (typeof x === "string") {
      e.appendChild(document.createTextNode(x));
    } else if (x instanceof Node) {
      e.appendChild(x);
    }
  }
  append(children);
  return e;
}

m.icon = (cls) => m("i", { class: cls });
m.item = (arg) => m("div", { class: "item clickable", onclick: arg.onclick }, [
  m.icon(arg.icon), arg.text
]);

var scroller = {
  top: 0,
  pause() {
    this.top = document.scrollingElement.scrollTop;
  },
  resume() {
    document.scrollingElement.scrollTop = this.top;
  },
  scrollTop(val) {
    this.top = val || 0;
    this.resume();
  }
};

var dictionary = {
  defaultOTM: '{"words":[]}',
  defaultWord: '{"entry":{"id":-1,"form":""},"translations":[],"tags":[],"contents":[],"variations":[],"relations":[]}',
  changed: false,
  currentPath: null,
  currentEntry: null,
  refresh: function () {
    localStorage.setItem("temp", JSON.stringify(otm));
    $(".search-field").trigger("input");
  },
  overwrite: function () {
    const name = dictionary.currentEntry ? dictionary.currentEntry.name : null;
    if (!name) return alert("上書き先がありません");
    if (confirm(`${name}\n${dictionary.currentPath}\nに現在のデータを上書きします`)) {
      dictionary.currentEntry.update(
        dictionary.compose()
      ).then(() => {
        alert("上書きしました");
        dictionary.changed = false;
      });
    }
  },
};

var otm;

import App from './components/App';

dictionary.load = function (str, entry, path, url) {
  var _otm;
  try {
    _otm = JSON.parse(str);
    if (!app.validateOTM(_otm)) {
      throw "OTM-JSON のフォーマットが正しくありません。";
    }
  } catch (e) {
    alert(e);
    return;
  }
  hideModal($("#opener"));
  otm = _otm;
  dictionary.changed = false;
  dictionary.currentEntry = entry;
  dictionary.currentPath = path;
  $("#info-path").text(path.split("/").pop());
  dictionary.refresh();
  ReactDOM.render(
    React.createElement(App, {
      dictionary: str,
    }),
    document.getElementById("app")
  );
  const newURL = new URL(location.href);
  if (url) {
    newURL.search = new URLSearchParams({ r: url });
  } else {
    newURL.search = "";
  }
  history.replaceState(null, null, newURL.toString());
}

import globalSettings from './app/globalSettings';

dictionary.compose = function () {
  const space = globalSettings.get("prettify-json");
  if (space === "zpdic") {
    return jacksonPrettyPrint(otm);
  } else {
    return JSON.stringify(otm, null, space);
  }
};


function promptForFileName() {
  while (true) {
    var p = prompt("ファイル名を入力", ".json");
    if (p === "") alert("入力してください");
    else if (!/[\\\/:,;*?"<>|]/.test(p)) return p;
    else alert("使えない文字が含まれています");
  }
}

function openerList({ resource, title }) {
  resource.dir().then(res => {
    pushPage({
      header: title,
      content: res.map(entry => {
        if (entry.isFolder) {
          return m.item({
            icon: "fas fa-folder",
            text: entry.name,
            onclick() {
              openerList({ resource: entry, title: entry.name });
            },
          });
        } else {
          return m.item({
            icon: "far fa-file",
            text: entry.name,
            onclick() {
              entry.read().then(text => {
                dictionary.load(text, entry, entry.path);
              });
            },
          });
        }
      })
    });
  });
}


function saverList({ resource, title }) {
  resource.dir().then(res => {
    pushPage({
      header: title,
      content: [
        m.item({
          icon: "fas fa-plus",
          text: "新しいファイルとして保存",
          onclick() {
            const name = promptForFileName();
            if (!name) return;
            resource.create(name, dictionary.compose()).then(() => {
              alert("保存しました。");
              dictionary.changed = false;
              hideModal();
            });
          },
        }),
        res.map(entry => {
          if (entry.isFolder) {
            return m.item({
              icon: "fas fa-folder",
              text: entry.name,
              onclick() {
                saverList({ resource: entry, title: entry.name });
              },
            });
          } else {
            return m.item({
              icon: "far fa-file",
              text: entry.name,
              onclick() {
                if (!confirm(`${entry.path}\nに上書きしますか？`)) return;
                entry.update(dictionary.compose()).then(() => {
                  alert("上書き保存しました。");
                  dictionary.changed = false;
                  hideModal();
                });
              },
            });
          }
        }),
      ]
    });
  });
}

function showModal($e) {
  $e.show();
  setTimeout(() => {
    $e.addClass("show");
  }, 0);
  scroller.pause();
  setTimeout(() => {
    $("#content").hide();
  }, 400);
}

function hideModal() {
  $(".modal").removeClass("show");
  $("#content").show();
  scroller.resume();
  setTimeout(() => {
    $(".modal").hide();
  }, 400);
}

$(".close").on("click", function () {
  hideModal();
});

$("#open").on("click", function () {
  if (!dictionary.changed || confirm("注：ファイルが変更されています。新しいファイルを開くと変更は破棄されます。")) {
    showModal($("#opener"));
  }
});

$("#save").on("click", function () {
  showModal($("#saver"));
});


$("#open-new").on("click", function () {
  dictionary.load(dictionary.defaultOTM, null, "new");
});

$("#open-local").on("click", function () {
  device.import().then(text => {
    dictionary.load(text, null, "local");
  });
});

$("#open-dropbox").on("click", function () {
  if (dropbox.loggedIn) {
    openerList({ resource: dropbox, title: `Dropbox` });
  } else {
    dropbox.logIn();
  }
});

$("#open-storage").on("click", function () {
  openerList({ resource: browser, title: `ブラウザストレージ` });
});

$("#open-help").on("click", function () {
  dictionary.load(JSON.stringify(require("./data/help")), null, "help");
});

$("#open-github").on("click", function () {
  if (github.loggedIn) {
    openerList({ resource: github, title: `GitHub Gist` });
  } else {
    github.logIn();
  }
});

$("#open-online").on("click", function () {
  const url = prompt(`JSON ファイルの URL を指定してください。\n・http: か https: で始まっていること\n・CORS に対応していること`);
  if (!url) return;
  if (!/^https?:\/\//.test(url)) return alert("URL の形式が正しくありません。");
  if (confirm(`${url} をインポートします`)) {
    fetch(url, { mode: "cors" })
      .then(res => res.text())
      .then(text => dictionary.load(text, null, url, url))
      .catch(err => alert(err));
  }
});

$("#save-overwrite").on("click", function () {
  dictionary.overwrite();
});

$("#save-local-text").on("click", function () {
  device.export(dictionary.compose(), { type: "text/plain" });
});

$("#save-local-bin").on("click", function () {
  device.export(dictionary.compose(), { type: "application/json;" });
});

$("#save-dropbox").on("click", function () {
  if (dropbox.loggedIn) {
    saverList({ resource: dropbox, title: `Dropbox` });
  } else {
    dropbox.logIn();
  }
});

$("#save-github").on("click", function () {
  if (github.loggedIn) {
    saverList({ resource: github, title: `GitHub Gist` });
  } else {
    github.logIn();
  }
});

$("#save-storage").on("click", function () {
  saverList({ resource: browser, title: `ブラウザストレージ` });
});

$("#save-clipboard").on("click", function () {
  execCopy(dictionary.compose())
    .then(() => alert("コピーしました"))
    .catch(() => alert("コピーに失敗しました"));
});


import fetchFromSearchParams from "./app/fetchFromSearchParams";

/* init */
fetchFromSearchParams()
  .then(({ text, url }) => {
    dictionary.load(text, null, url, url);
  })
  .catch(() => {
    const temp = localStorage.getItem("temp");
    if (temp) {
      dictionary.load(temp, null, "temp");
    } else {
      $("#open-help").trigger("click");
    }
  });
