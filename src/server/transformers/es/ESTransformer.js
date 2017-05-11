/**
 * A class to transform es responses
 * @property response : the response Object from es
 */
class ESTransformer {
  constructor(o, options) {
    this.o = o;
    this.options = options;
  }

  transform() {
    const res = this.o;
    return res;
  }
}

export default ESTransformer;
