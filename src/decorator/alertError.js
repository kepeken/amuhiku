export default function alertError(target, name, descriptor) {
  const original = descriptor.value;
  descriptor.value = function () {
    const promise = original.apply(this, arguments);
    promise.catch(err => {
      alert(err);
    });
    return promise;
  };
}
