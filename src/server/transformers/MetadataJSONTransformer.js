import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";
import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";

const BLACKLIST = ["__v"];

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class MetadataJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options = {}) {
    let res = super.transform(o, options);
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });
    return res;
  }
}

export default MetadataJSONTransformer;
