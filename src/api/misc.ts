import readAsText from '../util/readAsText';

export const importFromDevice = async () => {
  return new Promise<{ file: File, text: string }>((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    input.onchange = async () => {
      document.body.removeChild(input);
      if (input.files) {
        const file = input.files[0];
        const text = await readAsText(file);
        resolve({ file, text });
      }
    };
    document.body.appendChild(input);
    input.click();
  });
};

export const importByURL = async (url: string) => {
  if (!/^https?:\/\//.test(url)) {
    throw new Error("無効な URL です。");
  }
  url = new URL(url).href;
  const res = await fetch(url, { mode: "cors" });
  return res.text();
};

export const exportAsFile = async (text: string, blobOptions: BlobPropertyBag) => {
  return new Promise<string>((resolve, reject) => {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    // const blob = new Blob([bom, text], { type: path === "text" ? "text/plain" : "application/json;" });
    const blob = new Blob([bom, text], blobOptions);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.target = "_blank";
    a.click();
    // URL.revokeObjectURL(url);
    resolve();
  });
};
