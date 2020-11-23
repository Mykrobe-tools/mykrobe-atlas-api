import path from "path";

import CLIEventJSONTransformer from "./CLIEventJSONTransformer";

import Constants from "../../Constants";

/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class ResultsSavedJSONTransformer extends CLIEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = super.transform(o, options);

    res.event = Constants.EVENTS.RESULTS_SAVED.NAME;

    if (res.file) {
      res.file = path.basename(res.file);
    }

    if (o.experiment && o.experiment.results) {
      res.results = o.experiment.results;
    }

    return res;
  }
}

export default ResultsSavedJSONTransformer;
