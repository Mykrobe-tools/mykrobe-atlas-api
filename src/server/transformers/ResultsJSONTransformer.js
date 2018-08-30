import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";
import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";

const BLACKLIST = ["sequenceCalls", "variantCalls"];

/**
 * A class to transform results json responses
 * @property response : the response Object from mongoose
 */
class ResultsJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o) {
    let res = super.transform(o, {});
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });

    if (res.phylogenetics && res.phylogenetics.length) {
      const phylogenetics = {};
      res.phylogenetics.forEach(result => {
        const type = result.type;
        const phyloResult = result.result;
        phylogenetics[type] = {};
        phylogenetics[type][phyloResult] = {
          percentCoverage: result.percentCoverage,
          medianDepth: result.medianDepth
        };
      });
      res.phylogenetics = phylogenetics;
    }
    if (res.susceptibility && res.susceptibility.length) {
      const susceptibility = {};
      res.susceptibility.forEach(result => {
        const name = result.name;
        const prediction = result.prediction;
        susceptibility[name] = {
          prediction: result.prediction
        };
        if (result.calledBy) {
          susceptibility[name].calledBy = result.calledBy;
        }
      });
      res.susceptibility = susceptibility;
    }
    return res;
  }
}

export default ResultsJSONTransformer;
