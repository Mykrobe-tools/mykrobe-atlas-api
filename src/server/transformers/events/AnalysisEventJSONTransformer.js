import CLIEventJSONTransformer from "./CLIEventJSONTransformer";

/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class AnalysisEventJSONTransformer extends CLIEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = super.transform(o, options);

    if (o.fileLocation) {
      res.file = o.fileLocation;
    }

    if (o.experiment && o.experiment.id) {
      res.id = o.experiment.id;
    }

    if (o.type) {
      res.type = o.type;
    }

    return res;
  }
}

export default AnalysisEventJSONTransformer;
