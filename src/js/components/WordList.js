import m from "./hyperscript";
import app from "../app";
import WordCard from "./WordCard";


function SearchField({ update }) {
  let timeoutId = null;
  return m("input.search-field", {
    placeholder: "Search",
    oninput() {
      if (typeof timeoutId === "number") {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        update();
      }, 250);
    },
  });
}

function SearchOption({ update }) {
  return m("form.search-option", {
    onclick(e) {
      if (e.target.tagName === "INPUT") update();
    }
  }, [
      m("div", {}, [
        m("label", {}, [m("input", { type: "radio", name: "mode", value: "name", checked: true }), "単語"]),
        " ",
        m("label", {}, [m("input", { type: "radio", name: "mode", value: "equivalent" }), "訳語"]),
        " ",
        m("label", {}, [m("input", { type: "radio", name: "mode", value: "content" }), "全文"]),
      ]),
      m("div", {}, [
        m("label", {}, [m("input", { type: "radio", name: "type", value: "exact", checked: true }), "完全一致"]),
        " ",
        m("label", {}, [m("input", { type: "radio", name: "type", value: "part" }), "部分一致"]),
      ])
    ]);
}


export default function WordList({ dict, buttonFactory }) {
  function update() {
    const test = app.compileWordTester($field.value, {
      mode: $option.mode.value, type: $option.type.value
    });
    const result = dict.words.filter(test);
    $newResult =
      m(".search-result", {},
        result.map(word => {
          let button = null;
          if (buttonFactory) button = buttonFactory({ word });
          return WordCard({ word, button });
        })
      );
    $oldResult.parentNode.replaceChild($newResult, $oldResult);
    $oldResult = $newResult;
    $newResult = null;
    // Zepto
    $("#info-num").text(result.length);
  }
  const $field = SearchField({ update });
  const $option = SearchOption({ update });
  let $oldResult = m(".search-result");
  let $newResult = null;
  const ret = m(".word-list", {}, [
    $field,
    $option,
    $oldResult,
  ]);
  update();
  return ret;
}
