export default function execCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.readOnly = true;
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const result = document.execCommand("copy");
  document.body.removeChild(textarea);
  alert(result ? "コピーしました" : "コピーに失敗しました");
}
