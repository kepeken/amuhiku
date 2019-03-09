import React from 'react';
import ReactDOM from 'react-dom';

import './icons';

import {
  execCopy,
  jacksonPrettyPrint,
} from "./util";

import app from "./app";

import device from "./resource/device";

var dictionary = {
  defaultOTM: '{"words":[]}',
  defaultWord: '{"entry":{"id":-1,"form":""},"translations":[],"tags":[],"contents":[],"variations":[],"relations":[]}',
  changed: false,
  currentPath: null,
  currentEntry: null,
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
ReactDOM.render(
  React.createElement(App),
  document.getElementById("app")
);

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
  // hideModal($("#opener"));
  otm = _otm;
  dictionary.changed = false;
  dictionary.currentEntry = entry;
  dictionary.currentPath = path;
  // $("#info-path").text(path.split("/").pop());
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

// function saverList({ resource, title }) {
//   resource.dir().then(res => {
//     pushPage({
//       header: title,
//       content: [
//         m.item({
//           icon: "fas fa-plus",
//           text: "新しいファイルとして保存",
//           onclick() {
//             const name = promptForFileName();
//             if (!name) return;
//             resource.create(name, dictionary.compose()).then(() => {
//               alert("保存しました。");
//               dictionary.changed = false;
//               hideModal();
//             });
//           },
//         }),
//         res.map(entry => {
//           if (entry.isFolder) {
//             return m.item({
//               icon: "fas fa-folder",
//               text: entry.name,
//               onclick() {
//                 saverList({ resource: entry, title: entry.name });
//               },
//             });
//           } else {
//             return m.item({
//               icon: "far fa-file",
//               text: entry.name,
//               onclick() {
//                 if (!confirm(`${entry.path}\nに上書きしますか？`)) return;
//                 entry.update(dictionary.compose()).then(() => {
//                   alert("上書き保存しました。");
//                   dictionary.changed = false;
//                   hideModal();
//                 });
//               },
//             });
//           }
//         }),
//       ]
//     });
//   });
// }

$("#open").on("click", function () {
  if (!dictionary.changed || confirm("注：ファイルが変更されています。新しいファイルを開くと変更は破棄されます。")) {
    // showModal($("#opener"));
  }
});


$("#open-new").on("click", function () {
  dictionary.load(dictionary.defaultOTM, null, "new");
});

$("#open-local").on("click", function () {
  device.import().then(text => {
    dictionary.load(text, null, "local");
  });
});

$("#open-help").on("click", function () {
  dictionary.load(JSON.stringify(require("./data/help")), null, "help");
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

$("#save-clipboard").on("click", function () {
  execCopy(dictionary.compose())
    .then(() => alert("コピーしました"))
    .catch(() => alert("コピーに失敗しました"));
});
