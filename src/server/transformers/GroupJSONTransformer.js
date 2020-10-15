import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";
import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";
import SearchJSONTransformer from "./SearchJSONTransformer";
import ExperimentJSONTransformer from "./ExperimentJSONTransformer";

const BLACKLIST = ["__v"];

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class GroupJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options = {}) {
    let res = super.transform(o, options);
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });
    if (res.search) {
      res.search = new SearchJSONTransformer().transform(res.search, options);
    }

    if (res.experiments) {
      res.experiments = res.experiments.map(experiment =>
        new ExperimentJSONTransformer().transform(experiment, options)
      );
    }

    return res;
  }
}

export default GroupJSONTransformer;
