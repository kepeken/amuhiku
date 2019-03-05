export default function readAsText(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    // FileReader.result の型は string | ArrayBuffer | null だが、
    // readAsText を呼んでいるため成功時は string であることが保証されるはず。
    // 詳しくは https://w3c.github.io/FileAPI/#dfn-result を参照。
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}
