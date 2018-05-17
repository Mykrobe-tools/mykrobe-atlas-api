import JSONTransformer from "./JSONTransformer";
/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class BlacklistTransformer extends JSONTransformer {
  /**
   * The constructor
   */
  constructor(o, options) {
    super(o, options);

    if (options && options.blacklist) {
      this.blacklist = options.blacklist;
    }
  }
  /**
   * The transformation engine
   */
  transform() {
    const res = super.transform();
    this.blacklist.forEach(field => {
      delete res[field];
    });
    return res;
  }
}

export default BlacklistTransformer;
