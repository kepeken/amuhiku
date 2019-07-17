interface Options {
  accept?: string;
}

const inputFile = (optinons?: Options) => {
  return new Promise<File>((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    if (optinons && optinons.accept) {
      input.accept = optinons.accept;
    }
    input.style.display = "none";
    input.onchange = () => {
      document.body.removeChild(input);
      if (input.files && input.files[0]) {
        const file = input.files[0];
        resolve(file);
      } else {
        reject();
      }
    };
    document.body.appendChild(input);
    input.click();
  });
};

export default inputFile;
