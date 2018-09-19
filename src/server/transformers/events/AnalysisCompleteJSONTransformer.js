import path from "path";
import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";

import AnalysisEventJSONTransformer from "./AnalysisEventJSONTransformer";
import ResultsJSONTransformer from "../ResultsJSONTransformer";

/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class AnalysisCompleteJSONTransformer extends AnalysisEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = super.transform(o, options);

    res.event = "Analysis complete";
    res.file = path.basename(res.file);

    const results = options.results;
    if (results) {
      res.results = new ArrayJSONTransformer().transform(results, {
        transformer: ResultsJSONTransformer
      });
    }

    return res;
  }
}

export default AnalysisCompleteJSONTransformer;
