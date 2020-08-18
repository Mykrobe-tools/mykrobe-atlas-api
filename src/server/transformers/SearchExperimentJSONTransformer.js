import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";
import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";
import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";
import UserJSONTransformer from "./UserJSONTransformer";
import OrganisationJSONTransformer from "./OrganisationJSONTransformer";
import ResultsJSONTransformer from "./ResultsJSONTransformer";
import MetadataJSONTransformer from "./MetadataJSONTransformer";
import ExperimentResultsPerTypeJSONTransformer from "./ExperimentResultsPerTypeJSONTransformer";

const BLACKLIST = ["__v"];

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class ExperimentJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options = {}) {
    let res = super.transform(o, options);
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });
    if (res.owner) {
      res.owner = new UserJSONTransformer().transform(res.owner, options);
    }

    if (res.metadata) {
      res.metadata = new MetadataJSONTransformer().transform(res.metadata, options);
    }

    if (res.results) {
      if (res.results["distance"]) {
        delete res.results["distance"];
      }
    }

    return res;
  }
}

export default ExperimentJSONTransformer;
