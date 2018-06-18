import readAsText from "../util/readAsText";

class DeviceResourceHandler {

  import() {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.style.display = "none";
      input.onchange = function () {
        document.body.removeChild(input);
        resolve(readAsText(this.files[0]));
      };
      document.body.appendChild(input);
      input.click();
    });
  }

  export(text, blobOptions) {
    return new Promise((resolve, reject) => {
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      // const blob = new Blob([bom, text], { type: path === "text" ? "text/plain" : "application/json;" });
      const blob = new Blob([bom, text], blobOptions);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // a.download = "test.json";
      a.target = "_blank";
      a.click();
      // URL.revokeObjectURL(url);
      resolve();
    });
  }
}

export default new DeviceResourceHandler();
