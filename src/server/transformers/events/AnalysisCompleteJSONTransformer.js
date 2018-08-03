import AnalysisEventJSONTransformer from "./AnalysisEventJSONTransformer";

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
    res.results = options.results;
    return res;
  }
}

export default AnalysisCompleteJSONTransformer;
