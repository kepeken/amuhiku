import m from "./hyperscript";
import app from "../app";
import WordListItem from "./WordListItem";


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
  const SIZE = 100;
  function update() {
    const test = app.compileWordTester($field.value, {
      mode: $option.mode.value, type: $option.type.value
    });
    const result = dict.words.filter(test);
    let page = 0;
    const $showMoreButton = m("button.show-more", { onclick: append });
    $newResult = m(".search-result", {}, $showMoreButton);
    $oldResult.parentNode.replaceChild($newResult, $oldResult);
    $oldResult = $newResult;
    $newResult = null;
    function append() {
      const fragment = document.createDocumentFragment();
      result.slice(page * SIZE, (page + 1) * SIZE).map(word => {
        let button = null;
        if (buttonFactory) button = buttonFactory({ word });
        fragment.appendChild(WordListItem({ word, button }));
      });
      $oldResult.insertBefore(fragment, $showMoreButton);
      page++;
      const rest = result.length - page * SIZE;
      if (rest > 0) {
        $showMoreButton.style.display = null;
        $showMoreButton.textContent = `次の ${Math.min(SIZE, rest)} 件を表示`;
      } else {
        $showMoreButton.style.display = "none";
      }
    }
    append();
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
