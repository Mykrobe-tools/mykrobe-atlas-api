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
  transform(o) {
    let res = super.transform(o, {});
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });
    if (res.owner) {
      res.owner = new UserJSONTransformer().transform(res.owner);
    }

    if (res.metadata) {
      res.metadata = new MetadataJSONTransformer().transform(res.metadata);
    }

    if (res.results) {
      res.results = new ExperimentResultsPerTypeJSONTransformer().transform(res.results, {});
    }
    return res;
  }
}

export default ExperimentJSONTransformer;
