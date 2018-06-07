import JSONTransformer from "./JSONTransformer";

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class IdTransformer extends JSONTransformer {
  /**
   * The transformation engine
   */
  transform() {
    const res = super.transform();
    if (res._id) {
      res.id = res._id;
      delete res._id;
    }
    return res;
  }
}

export default IdTransformer;
