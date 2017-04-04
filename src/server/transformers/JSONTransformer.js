/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class JSONTransformer {
  constructor(o, options) {
    this.o = o;
    this.options = options;
  }

  transform() {
    const res = this.o;
    return res;
  }
}

export default JSONTransformer;
