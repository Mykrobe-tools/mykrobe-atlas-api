import ModelJSONTransformer from "./ModelJSONTransformer";
import BlacklistTransformer from "./BlacklistTransformer";
import UserJSONTransformer from "./UserJSONTransformer";
import OrganisationJSONTransformer from "./OrganisationJSONTransformer";
import ArrayJSONTransformer from "./ArrayJSONTransformer";
import ResultsJSONTransformer from "./ResultsJSONTransformer";
import MetadataJSONTransformer from "./MetadataJSONTransformer";

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

    if (res.metadata) {
      res.metadata = new MetadataJSONTransformer(res.metadata).transform();
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
