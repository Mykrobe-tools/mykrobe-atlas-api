import JSONTransformer from './JSONTransformer';

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class WhitelistTransformer extends JSONTransformer {
  /**
   * The constructor
   */
  constructor(o, options) {
    super(o, options);

    if (options && options.whitelist) {
      this.whitelist = options.whitelist;
    }
  }
 /**
  * The transformation engine
  */
  transform() {
    if (this.whitelist.length > 0) {
      const res = {};
      this.whitelist.forEach((field) => {
        res[field] = this.o[field];
      }, this);
      return res;
    }
    return this.o;
  }
}

export default WhitelistTransformer;
