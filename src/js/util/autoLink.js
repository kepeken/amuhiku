import escapeHTML from "./escapeHTML";

export default function autoLink(string) {
  return escapeHTML(string).replace(/https?\:\/\/\S+/g, '<a href="$&" target="_blank">$&</a>');
}
