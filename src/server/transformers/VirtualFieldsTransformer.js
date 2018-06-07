import JSONTransformer from "./JSONTransformer";
/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class VirtualFieldsTransformer extends JSONTransformer {
  /**
   * The constructor
   */
  constructor(o, options) {
    super(o, options);

    if (options && options.virtualFields) {
      this.virtualFields = options.virtualFields;
    }
  }
  /**
   * The transformation engine
   */
  transform() {
    const res = super.transform();
    return Object.assign(res, this.virtualFields);
  }
}

export default VirtualFieldsTransformer;
