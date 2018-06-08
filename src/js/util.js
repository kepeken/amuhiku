export function swap(obj, x, y) {
  var temp = obj[x]
  obj[x] = obj[y]
  obj[y] = temp
}

export function repeat(str, count) {
  return Array(+count + 1).join(str);
}

export function escapeHTML(str) {
  return str.replace(/[&'`"<>]/g, function (match) {
    return { '&': '&amp;', "'": '&#x27;', '`': '&#x60;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[match];
  });
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^=!:${}()|[\]\/\\]/g, "\\$&");
}

export function autoLink(str) {
  return escapeHTML(str).replace(/https?\:\/\/\S+/g, '<a href="$&" target="_blank">$&</a>');
}
