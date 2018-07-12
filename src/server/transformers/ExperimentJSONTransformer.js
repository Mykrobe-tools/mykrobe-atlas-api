import ModelJSONTransformer from "./ModelJSONTransformer";
import BlacklistTransformer from "./BlacklistTransformer";
import UserJSONTransformer from "./UserJSONTransformer";
import OrganisationJSONTransformer from "./OrganisationJSONTransformer";
import ArrayJSONTransformer from "./ArrayJSONTransformer";
import ResultsJSONTransformer from "./ResultsJSONTransformer";

const BLACKLIST = ["__v"];

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class ExperimentJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform() {
    let res = super.transform();
    res = new BlacklistTransformer(res, { blacklist: BLACKLIST }).transform();
    if (res.owner) {
      res.owner = new UserJSONTransformer(res.owner).transform();
    }
    if (res.organisation) {
      res.organisation = new OrganisationJSONTransformer(
        res.organisation
      ).transform();
    }
    if (res.results) {
      res.results = new ArrayJSONTransformer(res.results, {
        transformer: ResultsJSONTransformer
      }).transform();
    }
    return res;
  }
}

export default ExperimentJSONTransformer;
