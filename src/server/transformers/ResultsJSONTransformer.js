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
  transform(o, options = {}) {
    let res = super.transform(o, options);
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });

    if (res.phylogenetics && res.phylogenetics.length) {
      const phylogenetics = {};
      res.phylogenetics.forEach(result => {
        const type = result.type;
        const phyloResult = result.result;
        if (!phylogenetics[type]) {
          phylogenetics[type] = {};
        }
        if (!phylogenetics[type][phyloResult]) {
          phylogenetics[type][phyloResult] = {};
        }
        if (result.percentCoverage) {
          phylogenetics[type][phyloResult].percent_coverage = result.percentCoverage;
        }
        if (result.medianDepth) {
          phylogenetics[type][phyloResult].median_depth = result.medianDepth;
        }
        if (result.lineage) {
          phylogenetics[type][phyloResult].lineage = result.lineage;
        }
        if (result.callsSummary) {
          phylogenetics[type][phyloResult].calls_summary = result.callsSummary;
        }
        if (result.calls) {
          phylogenetics[type][phyloResult].calls = result.calls;
        }
      });
      res.phylogenetics = phylogenetics;
    }

    const calledBy = options.calledBy || false;

    if (res.susceptibility && res.susceptibility.length) {
      const susceptibility = {};
      res.susceptibility.forEach(result => {
        const name = result.name;
        const prediction = result.prediction;
        susceptibility[name] = {
          prediction: result.prediction
        };
        if (calledBy && result.calledBy) {
          susceptibility[name].calledBy = result.calledBy;
        }
      });
      res.susceptibility = susceptibility;
    }

    // remove unwanted values
    const trimmed = this.trim(res);
    return trimmed;
  }

  trim(o) {
    const light = {};

    Object.keys(o).forEach(key => {
      const value = o[key];
      switch (typeof value) {
        case "object":
          if (value && value instanceof Date) {
            light[key] = value;
          } else if (Object.keys(value).length) {
            light[key] = value;
          }
          break;
        case "array":
          if (value.length) {
            light[key] = value;
          }
          break;
        case "boolean":
          light[key] = value;
          break;
        default:
          if (value) {
            light[key] = value;
          }
          break;
      }
    });

    return light;
  }
}

export default ResultsJSONTransformer;
