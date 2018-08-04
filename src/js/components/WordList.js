import m from "./hyperscript";
import app from "../app";
import WordListItem from "./WordListItem";
import debounce from "lodash/debounce";

function SearchField({ oninput }) {
  return m("input.search-field", {
    placeholder: "Search",
    oninput: debounce(oninput, 250),
  });
}

function SearchOptionsForm({ oninput }) {
  return m("form.search-option", {
    onchange: oninput,
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
  const SIZE = 120;
  let searchText = "";
  let searchOptions = { mode: "name", type: "exact" };
  function update() {
    const test = app.compileWordTester(searchText, searchOptions);
    const result = dict.words.filter(test);
    let page = 0;
    while ($searchResult.firstChild) $searchResult.removeChild($searchResult.firstChild);
    $searchResult.appendChild(
      m(".search-info", {}, `${result.length} / ${dict.words.length}`),
    );
    const $showMoreButton = m("button.show-more", { onclick: append });
    $searchResult.appendChild($showMoreButton);
    function append() {
      const fragment = document.createDocumentFragment();
      result.slice(page * SIZE, (page + 1) * SIZE).map(word => {
        let button = null;
        if (buttonFactory) button = buttonFactory({ word });
        fragment.appendChild(WordListItem({ word, button }));
      });
      $searchResult.insertBefore(fragment, $showMoreButton);
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
  }
  let $searchResult = m(".search-result");
  const ret = m(".word-list", {}, [
    SearchField({
      oninput() {
        searchText = this.value;
        update();
      }
    }),
    SearchOptionsForm({
      oninput() {
        searchOptions.mode = this.mode.value;
        searchOptions.type = this.type.value;
        update();
      }
    }),
    $searchResult,
  ]);
  update();
  return ret;
}
