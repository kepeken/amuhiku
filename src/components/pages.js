import m from "./hyperscript";

export function pushPage({ header, content }) {
  const modal = document.querySelector(".modal.show");
  const newPage =
    m(".page.page-right", {}, [
      m(".header", {}, [
        m(".header-left.clickable", { onclick() { popPage(); } },
          m("i.fas.fa-chevron-left")
        ),
        header
      ]),
      m("div.content.list", {}, content)
    ]);
  const oldPage = modal.lastElementChild;
  modal.appendChild(newPage);
  setTimeout(() => {
    newPage.classList.remove("page-right");
    oldPage.classList.add("page-left");
  }, 0);
}

export function popPage() {
  const modal = document.querySelector(".modal.show");
  const newPage = modal.lastElementChild;
  const oldPage = newPage.previousElementSibling;
  newPage.classList.add("page-right");
  oldPage.classList.remove("page-left");
  newPage.addEventListener("transitionend", function end() {
    newPage.removeEventListener("transitionend", end);
    modal.removeChild(newPage);
  }, false);
}
