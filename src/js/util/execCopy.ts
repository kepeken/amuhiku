export default async function execCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.readOnly = true;
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const result = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (result) {
    return Promise.resolve();
  } else {
    return Promise.reject();
  }
}
