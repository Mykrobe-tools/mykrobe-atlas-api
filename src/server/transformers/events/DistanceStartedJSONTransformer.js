import AnalysisEventJSONTransformer from "./AnalysisEventJSONTransformer";

import Constants from "../../Constants";

/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class DistanceStartedJSONTransformer extends AnalysisEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = super.transform(o, options);
    res.event = Constants.EVENTS.DISTANCE_SEARCH_STARTED.NAME;
    return res;
  }
}

export default DistanceStartedJSONTransformer;
