import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";
import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";

const BLACKLIST = ["__v"];

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class SearchJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o) {
    let res = super.transform(o, {});
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });
    return res;
  }
}

export default SearchJSONTransformer;