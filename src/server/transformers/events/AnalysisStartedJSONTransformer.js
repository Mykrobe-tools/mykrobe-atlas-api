import path from "path";
import AnalysisEventJSONTransformer from "./AnalysisEventJSONTransformer";

/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class AnalysisStartedJSONTransformer extends AnalysisEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = super.transform(o, options);

    res.file = path.basename(res.file);
    res.event = "Analysis started";

    return res;
  }
}

export default AnalysisStartedJSONTransformer;
