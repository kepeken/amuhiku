export default function escapeHTML(string) {
  return string.replace(/[&'`"<>]/g, function (match) {
    return { '&': '&amp;', "'": '&#x27;', '`': '&#x60;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[match];
  });
}
