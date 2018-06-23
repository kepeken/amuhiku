const $loader = document.querySelector("#loading");
$loader.style.display = "none";

const loader = {
  start() { $loader.style.display = ""; },
  end() { $loader.style.display = "none"; },
};

export default function load(target, name, descriptor) {
  const original = descriptor.value;
  descriptor.value = function () {
    loader.start();
    const promise = original.apply(this, arguments);
    promise.then(res => {
      loader.end();
      return res;
    }).catch(err => {
      loader.end();
      throw err;
    });
    return promise;
  };
}
