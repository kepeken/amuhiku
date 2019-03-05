export default function fetchFromSearchParams() {
  const params = new URLSearchParams(location.search);
  const url = params.get("r");
  if (url) {
    if (!/^https?:\/\//.test(url)) {
      alert("invalid url");
      return Promise.reject(null);
    }
    try {
      new URL(url);
    } catch (e) {
      alert(e);
      return Promise.reject(null);
    }
    return fetch(url, { mode: "cors" })
      .then(res => res.text())
      .then(text => ({ text, url }))
      .catch(err => { alert(err); throw null; });
  } else {
    return Promise.reject(null);
  }
}
