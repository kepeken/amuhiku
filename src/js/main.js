import * as u from "./util";
import readAsText from "./util/readAsText";
import jacksonPrettyPrint from "./util/jacksonPrettyPrint";
import _dropbox from "./resource/dropbox";
import _github from "./resource/github";

var a, m;

a = {}

a.execCopy = function (text) {
  var $e = m("textarea", { value: text, readOnly: true })
  document.body.appendChild($e)
  $e.select()
  $e.setSelectionRange(0, $e.value.length)
  var res = document.execCommand("copy")
  document.body.removeChild($e)
  alert(res ? "コピーしました" : "コピーに失敗しました")
}

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
}

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
// options, selected, disabled, callback
m.select = (arg) => {
  var arr = [];
  for (var k in arg.options) arr.push(m("option", { value: k, selected: arg.selected === k }, arg.options[k]));
  return m("select", {
    class: "item clickable",
    disabled: arg.disabled,
    onchange: function () { arg.callback(this.options[this.selectedIndex].value); }
  }, arr);
};
// value, disabled, callback
m.number = (arg) => {
  return m("input", {
    type: "number",
    class: "item",
    disabled: arg.disabled,
    value: arg.value,
    onchange: function () { arg.callback(this.value); }
  });
};

var loader = {
  $e: $("#loading").hide(),
  start: function () { this.$e.show(); },
  end: function () { this.$e.hide(); }
};

var scroller = {
  top: 0,
  pause: function () {
    this.top = document.documentElement.scrollTop || document.body.scrollTop;
  },
  resume: function () {
    document.documentElement.scrollTop = document.body.scrollTop = this.top;
  },
  scrollTop: function (val) {
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

var storage = (function () {
  var storage = {};
  storage.dir = (path, callback) => {
    var entries = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key[0] === "/") entries.push({
          isFolder: false, path: key, name: key.split("/").pop()
        });
      }
      callback(entries);
    } catch (e) {
      alert(e);
    }
  };
  storage.read = (path, callback) => {
    try {
      callback(localStorage.getItem(path));
    } catch (e) {
      alert(e);
    }
  };
  storage.write = (path, text, callback, overwrite) => {
    try {
      if (!overwrite && localStorage.getItem(path)) {
        throw "既に存在しています。";
      }
      localStorage.setItem(path, text);
      callback && callback();
    } catch (e) {
      alert(e);
    }
  };
  return storage;
})();

const dropbox = {

  logIn() {
    // クリックイベント時に呼び出すこと
    if (confirm(`Dropbox にログインします。`)) {
      _dropbox.logIn().then(() => {
        alert(`ログインしました。`);
      });
    }
  },

  dir(path, callback) {
    loader.start();
    _dropbox.dir(path).then((res) => {
      loader.end();
      callback && callback(res);
    }).catch((err) => {
      loader.end();
      alert(err);
    });
  },

  read(path, callback) {
    loader.start();
    _dropbox.read(path).then((res) => {
      loader.end();
      callback && callback(res);
    }).catch((err) => {
      loader.end();
      alert(err);
    });
  },

  write(path, text, callback, overwrite) {
    loader.start();
    let promise;
    if (overwrite) {
      promise = _dropbox.update(path, text);
    } else {
      promise = _dropbox.create(path, text);
    }
    promise.then((res) => {
      loader.end();
      callback && callback(res);
    }).catch((err) => {
      loader.end();
      alert(err);
    });
  },

};

const github = {

  logIn: function () {
    // クリックイベント時に呼び出すこと
    if (confirm(`GitHub にログインします。`)) {
      _github.logIn().then(() => {
        alert(`ログインしました。`);
      });
    }
  },

  dir(path, callback) {
    loader.start();
    _github.dir(path).then((res) => {
      loader.end();
      callback && callback(res);
    }).catch((err) => {
      loader.end();
      alert(err);
    });
  },

  read(path, callback) {
    loader.start();
    _github.read(path).then((res) => {
      loader.end();
      callback && callback(res);
    }).catch((err) => {
      loader.end();
      alert(err);
    });
  },

  write(path, text, callback, overwrite) {
    loader.start();
    let promise;
    if (overwrite) {
      promise = _github.update(path, text);
    } else {
      promise = _github.create(path, text, {
        public: confirm(`public にしますか？`),
      });
    }
    promise.then((res) => {
      loader.end();
      callback && callback(res);
    }).catch((err) => {
      loader.end();
      alert(err);
    });
  },

};


var dictionary = {
  defaultOTM: '{"words":[]}',
  defaultWord: '{"entry":{"id":-1,"form":""},"translations":[],"tags":[],"contents":[],"variations":[],"relations":[]}',
  changed: false,
  currentStorage: null,
  currentPath: null,
  refresh: function () {
    storage.write("temp", JSON.stringify(otm), null, true);
    $("#info-den").text(otm.words.length);
    a.search(null);
  },
  overwrite: function () {
    var name = (function () {
      switch (dictionary.currentStorage) {
        case dropbox: return "Dropbox";
        case github: return "GitHub Gist";
        case storage: return "ブラウザストレージ";
        default: return null;
      }
    })();
    if (!name) return alert("上書き先がありません");
    if (confirm(`${name}\n${dictionary.currentPath}\nに現在のデータを上書きします`)) {
      dictionary.currentStorage.write(
        dictionary.currentPath, dictionary.compose(), () => {
          alert("上書きしました");
          dictionary.changed = false;
        }, true
      );
    }
  },
  settings: {
    data: (function () {
      var def = {
        "prettify-json": null
      };
      var data;
      storage.read("settings", _ => data = _);
      return data ? JSON.parse(data) : def;
    })(),
    set: (k, v) => {
      dictionary.settings.data[k] = v;
      storage.write("settings", JSON.stringify(dictionary.settings.data), null, true);
    },
    get: (k) => {
      return dictionary.settings.data[k];
    }
  }
};

var otm;


dictionary.checkOTM = (function () {
  // http://ja.conlinguistics.wikia.com/wiki/OTM-JSON
  var string = x => typeof x === "string";
  var integer = x => x | 0 === x;
  var array = t => x => Array.isArray(x) && x.every(t);
  var object = t => x => {
    if (typeof x !== "object" || !x) return false;
    for (var k in t) if (!t[k](x[k])) return false;
    return true;
  };
  var translation = object({ title: string, forms: array(string) });
  var content = object({ title: string, text: string });
  var variation = object({ title: string, form: string });
  var relation = object({ title: string, entry: object({ id: integer, form: string }) });
  var word = object({
    entry: object({ id: integer, form: string }),
    translations: array(translation),
    tags: array(string),
    contents: array(content),
    variations: array(variation),
    relations: array(relation)
  });
  return object({
    words: array(word)
  });
})();


dictionary.load = function (str, sto, path) {
  var _otm;
  try {
    _otm = JSON.parse(str);
    if (!dictionary.checkOTM(_otm)) {
      throw "OTM-JSON のフォーマットが正しくありません。";
    }
  } catch (e) {
    alert(e);
    return;
  }
  hideModal($("#opener"));
  otm = _otm;
  dictionary.changed = false;
  dictionary.currentStorage = sto;
  dictionary.currentPath = path;
  $("#info-path").text(path.split("/").pop());
  dictionary.refresh();
  a.search("");
}

dictionary.compose = function () {
  const space = dictionary.settings.get("prettify-json");
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


// data: { title, content: [ { icon, onclick, text } ] }
function pushPage(data) {
  var modal = document.querySelector(".modal.show");
  var newPage = m("div", { class: "page page-right" }, [
    m("div", { class: "header" }, [
      m("div", {
        class: "header-left clickable",
        onclick: function () {
          removePage(data);
        }
      }, [
          m.icon("fas fa-chevron-left")
        ]),
      data.title
    ]),
    m("div", { class: "list" }, data.content)
  ]);
  var oldPage = modal.lastElementChild;
  modal.appendChild(newPage);
  setTimeout(function () {
    newPage.classList.remove("page-right");
    oldPage.classList.add("page-left");
  }, 0);
}

function removePage(data) {
  var modal = document.querySelector(".modal.show");
  var newPage = modal.lastElementChild;
  var oldPage = newPage.previousElementSibling;
  newPage.classList.add("page-right");
  oldPage.classList.remove("page-left");
  setTimeout(function () {
    modal.removeChild(newPage);
  }, 400);
}

function openerList({ path, resource, title }) {
  resource.dir(path, (res) => {
    pushPage({
      title,
      content: res.map(entry => {
        var item = {};
        item.text = entry.name;
        if (entry.isFolder) {
          item.icon = "fas fa-folder";
          item.onclick = function () {
            openerList({ path: entry.path, resource, title: entry.name });
          };
        } else {
          item.icon = "far fa-file";
          item.onclick = function () {
            resource.read(entry.path, (text) => dictionary.load(text, resource, entry.path));
          };
        }
        return m.item(item);
      })
    });
  });
}


function saverList({ path, resource, title }) {
  resource.dir(path, (res) => {
    pushPage({
      title,
      content: [
        m.item({
          icon: "fas fa-plus",
          onclick: function () {
            var name = promptForFileName();
            if (name) {
              resource.write(`${path}/${name}`, dictionary.compose(), () => {
                alert("保存しました。");
                dictionary.changed = false;
                hideModal();
              }, false);
            }
          },
          text: "新しいファイルとして保存"
        }),
        res.map(entry => {
          var item = {};
          item.text = entry.name;
          if (entry.isFolder) {
            item.icon = "fas fa-folder";
            item.onclick = function () {
              saverList({ path: entry.path, resource, title: entry.name });
            };
          } else {
            item.icon = "far fa-file";
            item.onclick = function () {
              if (confirm(`${entry.path}\nに上書きしますか？`)) {
                resource.write(entry.path, dictionary.compose(), () => {
                  alert("上書き保存しました。");
                  dictionary.changed = false;
                  hideModal();
                }, true);
              }
            };
          }
          return m.item(item);
        }),
      ]
    });
  });
}

function showModal($e) {
  $e.addClass("show");
  scroller.pause();
  setTimeout(function () {
    $("#content").hide();
  }, 400);
}

function hideModal() {
  $(".modal").removeClass("show");
  $("#content").show();
  scroller.resume();
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
  $("#searcher").addClass("show");
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
  if (_dropbox.loggedIn) {
    openerList({ path: "", resource: dropbox, title: `Dropbox` });
  } else {
    dropbox.logIn();
  }
});

$("#open-storage").on("click", function () {
  openerList({ path: "", resource: storage, title: `ブラウザストレージ` });
});

$("#open-help").on("click", function () {
  dictionary.load($("#help-json").text(), null, "help");
});

$("#open-github").on("click", function () {
  if (_github.loggedIn) {
    openerList({ path: "", resource: github, title: `GitHub Gist` });
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
  if (_dropbox.loggedIn) {
    saverList({ path: "", resource: dropbox, title: `Dropbox` });
  } else {
    dropbox.logIn();
  }
});

$("#save-github").on("click", function () {
  if (_github.loggedIn) {
    saverList({ path: "", resource: github, title: `GitHub Gist` });
  } else {
    github.logIn();
  }
});

$("#save-storage").on("click", function () {
  saverList({ path: "", resource: storage, title: `ブラウザストレージ` });
});

$("#save-clipboard").on("click", function () {
  a.execCopy(dictionary.compose())
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
        m("div", { class: "otm-content-text", innerHTML: u.autoLink(cont.text) }),
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
    // p[0] === "-" ? "(?!.*" + u.escapeRegExp(p.substr(1)) + ")" :
    "(?=.*" + u.escapeRegExp(p) + ")"
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
  $("#content").empty().append(m.fragment(view));
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

m.propEditor = function (opt) {
  var create = data =>
    m("div", { class: "ed-" + opt.prop }, [
      m.propExchanger(),
      m.propDeleter(),
      opt.view(data)
    ]);
  return m("div", { class: "ed-" + opt.prop + "s ed" }, [
    opt.word[opt.prop + "s"].map(create),
    m("div", {
      class: "add-item clickable",
      onclick: function () {
        this.parentNode.insertBefore(create(null), this);
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
  return m("div", { class: "list" }, [
    m("h4", null, "単語"),
    m("div", { class: "ed-entry ed" }, [
      m("input", { placeholder: "見出し語", value: word.entry.form }),
      m("span", null, "#" + word.entry.id)
    ]),
    m("hr"),
    m("h4", null, "訳語"),
    m.propEditor({
      word: word,
      prop: "translation",
      view: (t) => [
        m("input", { placeholder: "品詞など", value: t && t.title }),
        m("textarea", { placeholder: "訳語", value: t && t.forms.join(", ") })
      ]
    }),
    m("hr"),
    m("h4", null, "タグ"),
    m.propEditor({
      word: word,
      prop: "tag",
      view: (t) => [
        m("input", { placeholder: "", value: t })
      ]
    }),
    m("hr"),
    m("h4", null, "内容"),
    m.propEditor({
      word: word,
      prop: "content",
      view: (t) => [
        m("input", { placeholder: "", value: t && t.title }),
        m("textarea", { placeholder: "", value: t && t.text })
      ]
    }),
    m("hr"),
    m("h4", null, "変化形"),
    m.propEditor({
      word: word,
      prop: "variation",
      view: (t) => [
        m("input", { placeholder: "説明", value: t && t.title }),
        m("input", { placeholder: "綴り", value: t && t.form })
      ]
    }),
    m("hr"),
    m("h4", null, "関連語"),
    m.propEditor({
      word: word,
      prop: "relation",
      view: (t) => [
        m("input", { placeholder: "説明", value: t && t.title }),
        m("input", { placeholder: "ID", value: t && t.entry.id }),
        m("input", { placeholder: "単語", value: t && t.entry.form }),
      ]
    }),
  ]);
}

function pickEditor() {
  var $e = $("#editor");
  return {
    entry: {
      id: $e.find(".ed-entry span").text().replace(/^#/, "") | 0,
      form: $e.find(".ed-entry input").val()
    },
    translations: $e.find(".ed-translation").map((i, t) => ({
      title: t.querySelector("input").value,
      forms: t.querySelector("textarea").value.split(/\,\s*|、|\s+/g)
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
    title: "設定",
    content: m("div", { class: "settings" }, [
      m("h5", null, "出力する JSON の整形："),
      sel = m("select", {
        class: "item clickable",
        onchange() {
          const space = this.value === "none" ? null : this.value;
          dictionary.settings.set("prettify-json", space);
        },
      }, [
          m("option", { value: "none", text: "整形しない" }),
          m("option", { value: "zpdic", text: "ZpDIC 準拠" }),
          m("option", { value: "  ", text: "スペース ×2" }),
          m("option", { value: "    ", text: "スペース ×4" }),
          m("option", { value: "\t", text: "タブ" }),
        ]),
    ])
  });
  const space = dictionary.settings.get("prettify-json");
  sel.value = space === null ? "none" : space;
});

/* init */
(function () {
  storage.write("v", "20180308", null, true);
  storage.read("temp", (text) => {
    if (text) {
      dictionary.load(text, null, "temp");
    } else {
      $("#open-help").trigger("click");
    }
  });
})();
