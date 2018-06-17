/**
 * 
 * @param {string} _tag
 * @param {*} attrs
 * @param {*} children
 * @returns {HTMLElement}
 */
export default function (_tag, attrs, children) {
  const match = _tag.match(/^((?:[\-\w]+)?)((?:#[\-\w]+)?)((?:\.[\-\w]+)*)/) || [];
  const [, tag, id, classes] = match;
  const e = document.createElement(tag || "div");
  if (id) e.id = id.slice(1);
  if (classes) for (const c of classes.slice(1).split(".")) e.classList.add(c);
  const pname = { "class": "className", "data": "dataset" };
  if (attrs) {
    for (const [_name, value] of Object.entries(attrs)) {
      const name = pname[_name] || _name;
      if (name === "style" || name === "data") {
        Object.assign(e[name], value);
      } else {
        e[name] = value;
      }
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

  if (tag === "select") {
    if (attrs && "value" in attrs) e.value = attrs.value;
  }

  return e;
}
