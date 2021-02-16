import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";
import ExperimentJSONTransformer from "./ExperimentJSONTransformer";

const BLACKLIST = ["results"];

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class ExperimentJobJSONTransformer extends ExperimentJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options = {}) {
    let res = super.transform(o, options);
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });

    return res;
  }
}

export default ExperimentJobJSONTransformer;
