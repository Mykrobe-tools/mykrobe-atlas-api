import AnalysisEventJSONTransformer from "./AnalysisEventJSONTransformer";

import Constants from "../../Constants";

/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class DistanceCompletedJSONTransformer extends AnalysisEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = super.transform(o, options);

    return {
      event: Constants.EVENTS.DISTANCE_SEARCH_COMPLETE.NAME,
      getURL: `/experiments/${res.id}`,
      ...res
    };
  }
}

export default DistanceCompletedJSONTransformer;
