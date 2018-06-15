import {
  autoLink,
  escapeRegExp,
  execCopy,
  jacksonPrettyPrint,
  readAsText,
} from "./util";

import app from "./app";

import resourceHandler from "./resource/all";
const browser = resourceHandler.get("browser");
const dropbox = resourceHandler.get("dropbox");
const github = resourceHandler.get("github");

import { pushPage, popPage } from "./components/pages";

var a, m;

a = {};

m = function (tag, attrs, children) {
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

m.fragment = (children) => {
  return m(document.createDocumentFragment(), null, children)
};

m.icon = (cls) => m("i", { class: cls });
m.item = (arg) => m("div", { class: "item clickable", onclick: arg.onclick }, [
  m.icon(arg.icon), arg.text
]);
// text, value, callback
m.checkbox = (arg) => {
  var checkIcon = { true: "fas fa-check-square", false: "far fa-square" }
  var $icon;
  var value = !!arg.value;
  return m("div", {
    class: "item clickable",
    onclick: function () {
      value = !value;
      $icon.className = checkIcon[value];
      arg.callback(value);
    }
  }, [
      $icon = m.icon(checkIcon[value]),
      arg.text
    ]);
};

var scroller = {
  top: 0,
  pause() {
    this.top = document.documentElement.scrollTop || document.body.scrollTop;
  },
  resume() {
    document.documentElement.scrollTop = document.body.scrollTop = this.top;
  },
  scrollTop(val) {
    this.top = val || 0;
    this.resume();
  }
};

var localFile = (function () {
  var localFile = {};
  var _callback = null;
  var $e = m("input", {
    type: "file",
    accept: ".json",
    style: { display: "none" },
    onchange: function () {
      readAsText(this.files[0]).then(_callback).catch((err) => alert(err));
    }
  });
  document.body.appendChild($e);
  localFile.read = function (path, callback) {
    /* クリックイベント発火時に呼び出すこと */
    _callback = callback;
    $e.click();
  };
  localFile.write = (path, text, callback) => {
    /* クリックイベント発火時に呼び出すこと */
    var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    var blob = new Blob([bom, text], { type: path === "text" ? "text/plain" : "application/json;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    //a.download = "test.json";
    a.target = "_blank";
    a.click();
    //URL.revokeObjectURL(url);
    callback && callback();
  };
  return localFile;
})();


var dictionary = {
  defaultOTM: '{"words":[]}',
  defaultWord: '{"entry":{"id":-1,"form":""},"translations":[],"tags":[],"contents":[],"variations":[],"relations":[]}',
  changed: false,
  currentPath: null,
  currentEntry: null,
  refresh: function () {
    localStorage.setItem("temp", JSON.stringify(otm));
    $("#info-den").text(otm.words.length);
    a.search(null);
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

dictionary.load = function (str, entry, path) {
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
  a.search("");
}

dictionary.compose = function () {
  const space = app.globalSettings.get("prettify-json");
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

$("#search").on("click", function () {
  scroller.scrollTop();
  $("#searcher-field").trigger("focus");
});

$("#add").on("click", function () {
  openWordEditor(null);
});



$("#open-new").on("click", function () {
  dictionary.load(dictionary.defaultOTM, null, "new");
});

$("#open-local").on("click", function () {
  localFile.read(null, (text) => dictionary.load(text, null, "local"));
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
  const url = prompt(`JSON ファイルの URL を指定してください。\n・プロトコルは http: か https: であること\n・CORS に対応していること`);
  if (!url) return;
  if (!/^https?:\/\//.test(url)) return alert("URL の形式が正しくありません。");
  if (confirm(`${url} をインポートします`)) {
    fetch(url, { mode: "cors" })
      .then(res => res.text())
      .then(text => dictionary.load(text, null, url))
      .catch(err => alert(err));
  }
});

$("#save-overwrite").on("click", function () {
  dictionary.overwrite();
});

$("#save-local-text").on("click", function () {
  localFile.write("text", dictionary.compose());
});

$("#save-local-bin").on("click", function () {
  localFile.write("bin", dictionary.compose());
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
  execCopy(dictionary.compose());
});

m.wordViewer = function (word) {
  return m("div", { class: "otm-word" }, [
    m("span", {
      class: "edit clickable",
      onclick: function () {
        openWordEditor(word);
      }
    },
      m.icon("fas fa-edit")
    ),
    m("h3", { class: "otm-entry-form" }, word.entry.form),
    word.translations.map(function (trans) {
      return m("div", null, [
        m("span", { class: "otm-translation-title" }, trans.title),
        trans.forms.map(function (form) {
          return m("span", { class: "otm-translation-form" }, form)
        }),
      ]);
    }),
    m("div", null, [
      word.tags.map(function (tag) {
        return m("span", { class: "otm-tag" }, tag)
      })
    ]),
    word.contents.map(function (cont) {
      return m("div", null, [
        m("div", { class: "otm-content-title" }, cont.title),
        m("div", { class: "otm-content-text", innerHTML: autoLink(cont.text) }),
      ]);
    }),
    word.variations.map(function (va) {
      return m("div", null, [
        m("span", { class: "otm-variation-title" }, va.title),
        m("span", { class: "otm-variation-form" }, va.form),
      ]);
    }),
    word.relations.map(function (rel) {
      return m("div", null, [
        m("span", { class: "otm-relation-title" }, rel.title),
        //m("a", {class:"otm-relation-entry-form", href:"#"+rel.entry.id}, rel.entry.form),
        m("span", { class: "otm-relation-entry-form" }, rel.entry.form),
      ]);
    }),
  ]);
}

function compileWordTester(str) {
  var none = () => true;
  var m = str.match(/\S+/g);
  if (!m) return none;
  var re = new RegExp("^" + m.map(p =>
    // p[0] === "-" ? "(?!.*" + escapeRegExp(p.substr(1)) + ")" :
    "(?=.*" + escapeRegExp(p) + ")"
  ).join(""), "i");
  return (w) => {
    return re.test(w.entry.form) ||
      w.translations.some((c) => re.test(c.forms.join(" "))) ||
      re.test(w.tags.join(" ")) ||
      w.contents.some((c) => re.test(c.text)) ||
      w.variations.some((c) => re.test(c.form)) ||
      w.relations.some((c) => re.test(c.entry.form));
  };
}


var timeoutId = null;

$("#searcher-field").on("input", function () {
  if (typeof timeoutId === "number") {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    a.search(this.value);
  }, 250);
});

a.search = function (text) {
  var $field = $("#searcher-field");
  if (text === null) text = $field.val();
  else if ($field.val() !== text) $field.val(text);
  var test = compileWordTester(text);
  var view = otm.words.filter(test).map(m.wordViewer);
  $("#search-result").empty().append(m.fragment(view));
  $("#info-num").text(view.length);
}

m.propExchanger = function () {
  return m("div", {
    class: "exchange-item clickable",
    onclick: function () {
      var parent = this.parentNode;
      parent.parentNode.insertBefore(parent, parent.previousElementSibling);
    }
  }, [
      m.icon("fas fa-long-arrow-alt-up"),
      m.icon("fas fa-long-arrow-alt-down")
    ]);
}

m.propDeleter = function () {
  return m("div", {
    class: "delete-item clickable",
    onclick: function () {
      if (confirm("削除します")) {
        var parent = this.parentNode;
        parent.parentNode.removeChild(parent);
      }
    }
  },
    m.icon("fas fa-trash-alt")
  );
}

m.propEditor = function ({ word, prop, init, view }) {
  var create = data =>
    m("div", { class: "ed-" + prop }, [
      m.propExchanger(),
      m.propDeleter(),
      view(data)
    ]);
  return m("div", { class: "ed-" + prop + "s ed" }, [
    word[prop + "s"].map(create),
    m("div", {
      class: "add-item clickable",
      onclick: function () {
        this.parentNode.insertBefore(create(init), this);
      }
    }, m.icon("fas fa-plus"))
  ]);
}

function openWordEditor(word) {
  var title, addition;
  if (word) {
    addition = false;
    title = "Edit";
    $("#editor").data("mode", "edit");
  } else {
    addition = true;
    word = JSON.parse(dictionary.defaultWord);
    title = "Add";
    $("#editor").data("mode", "add");
    var maxId = otm.words.reduce((a, c) => Math.max(a, c.entry.id), -1);
    word.entry.id = maxId + 1;
  }
  $("#editor .header span").text(title);
  $("#editor .list").replaceWith(m.wordEditor(word));
  if (!addition) $("#editor .list").append(m.wordDeleter(word.entry.id));
  showModal($("#editor"));
  $("#editor").data("word", JSON.stringify(word));
}

m.wordEditor = function (word) {
  function join(formsArray) {
    const punct = (otm.zpdic || {}).punctuations || [",", "、"];
    punct[0] = punct[0] || ",";
    return formsArray.join(punct[0] + " ");
  }
  return m("div", { class: "list" }, [
    m("h4", null, "単語"),
    m("div", { class: "ed-entry ed" }, [
      m("input", { placeholder: "見出し語", value: word.entry.form }),
      m("span", null, `#${word.entry.id}`)
    ]),
    m("hr"),
    m("h4", null, "訳語"),
    m.propEditor({
      word: word,
      prop: "translation",
      init: { title: "", forms: [] },
      view: (t) => [
        m("input", { placeholder: "品詞など", value: t.title }),
        m("textarea", { placeholder: "訳語", value: join(t.forms) })
      ]
    }),
    m("hr"),
    m("h4", null, "タグ"),
    m.propEditor({
      word: word,
      prop: "tag",
      init: "",
      view: (t) => [
        m("input", { placeholder: "", value: t })
      ]
    }),
    m("hr"),
    m("h4", null, "内容"),
    m.propEditor({
      word: word,
      prop: "content",
      init: { title: "", text: "" },
      view: (t) => [
        m("input", { placeholder: "", value: t.title }),
        m("textarea", { placeholder: "", value: t.text })
      ]
    }),
    m("hr"),
    m("h4", null, "変化形"),
    m.propEditor({
      word: word,
      prop: "variation",
      init: { title: "", form: "" },
      view: (t) => [
        m("input", { placeholder: "説明", value: t.title }),
        m("input", { placeholder: "綴り", value: t.form })
      ]
    }),
    m("hr"),
    m("h4", null, "関連語"),
    m.propEditor({
      word: word,
      prop: "relation",
      init: { title: "", entry: { id: "", form: "" } },
      view: (t) => [
        m("input", { placeholder: "説明", value: t.title }),
        m("input", { placeholder: "ID", value: t.entry.id }),
        m("input", { placeholder: "単語", value: t.entry.form }),
      ]
    }),
  ]);
}

function pickEditor() {
  var $e = $("#editor");
  function split(formsString) {
    const punct = (otm.zpdic || {}).punctuations || [",", "、"];
    const re = new RegExp(punct.map(escapeRegExp).join("|") + "|\\n+");
    return formsString.split(re).map(s => s.trim());
  }
  return {
    entry: {
      id: $e.find(".ed-entry span").text().replace(/^#/, "") | 0,
      form: $e.find(".ed-entry input").val()
    },
    translations: $e.find(".ed-translation").map((i, t) => ({
      title: t.querySelector("input").value,
      forms: split(t.querySelector("textarea").value)
    })).get(),
    tags: $e.find(".ed-tag").map((i, t) => (
      t.querySelector("input").value
    )).get(),
    contents: $e.find(".ed-content").map((i, t) => ({
      title: t.querySelector("input").value,
      text: t.querySelector("textarea").value
    })).get(),
    variations: $e.find(".ed-variation").map((i, t) => ({
      title: t.querySelector("input:nth-child(3)").value,
      form: t.querySelector("input:nth-child(4)").value
    })).get(),
    relations: $e.find(".ed-relation").map((i, t) => ({
      title: t.querySelector("input:nth-child(3)").value,
      entry: {
        id: t.querySelector("input:nth-child(4)").value | 0,
        form: t.querySelector("input:nth-child(5)").value
      }
    })).get()
  }
}

m.wordDeleter = function (id) {
  return m("div", {
    class: "delete-word clickable",
    onclick: function () {
      if (confirm("単語を削除しますか？")) {
        otm.words = otm.words.filter(word => word.entry.id !== id);
        dictionary.changed = true;
        dictionary.refresh();
        alert("削除しました\nID: " + id);
        hideModal();
      }
    }
  }, [
      m.icon("fas fa-trash-alt"),
      "単語を削除"
    ]);
}

$("#editor .close").off("click").on("click", function () {
  if (JSON.stringify($("#editor").data("word")) === JSON.stringify(pickEditor())
    || confirm("閉じると変更は破棄されます。閉じますか？")) {
    hideModal();
  }
});

$("#editor-enter").on("click", function () {
  var picked = pickEditor();
  if (!/\S/.test(picked.entry.form)) {
    alert("単語を入力してください");
    return;
  }
  // if (JSON.stringify($("#editor").data("word")) === JSON.stringify(picked) || confirm(""))
  if ($("#editor").data("mode") === "edit") {
    otm.words.some((word, i, arr) => {
      if (word.entry.id === picked.entry.id) {
        arr[i] = picked;
        dictionary.changed = true;
        dictionary.refresh();
        alert("変更しました\nID: " + picked.entry.id);
        return true;
      }
    });
  } else {
    otm.words.push(picked);
    dictionary.changed = true;
    dictionary.refresh();
    alert("追加しました\nID: " + picked.entry.id);
  }
  hideModal();
});

$("#save-settings").on("click", function () {
  let sel;
  pushPage({
    header: "設定",
    content: m("div", { class: "settings" }, [
      m("h5", null, "出力する JSON の整形："),
      sel = m("select", {
        class: "item clickable",
        onchange() {
          app.globalSettings.set("prettify-json", this.value || null);
        },
      }, [
          m("option", { value: "", text: "整形しない" }),
          m("option", { value: "zpdic", text: "ZpDIC 準拠" }),
          m("option", { value: "  ", text: "スペース ×2" }),
          m("option", { value: "    ", text: "スペース ×4" }),
          m("option", { value: "\t", text: "タブ" }),
        ]),
    ])
  });
  sel.value = app.globalSettings.get("prettify-json") || "";
});

/* init */
(function () {
  const temp = localStorage.getItem("temp");
  if (temp) {
    dictionary.load(temp, null, "temp");
  } else {
    $("#open-help").trigger("click");
  }
})();
