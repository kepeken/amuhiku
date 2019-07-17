import inputFile from '../util/inputFile';
import readAsText from '../util/readAsText';

export const importFromDevice = async () => {
  const file = await inputFile({ accept: ".json" });
  const text = await readAsText(file);
  return { file, text };
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
