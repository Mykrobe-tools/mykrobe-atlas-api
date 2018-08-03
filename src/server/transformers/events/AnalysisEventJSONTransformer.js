/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class AnalysisEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = { id: options.id };
    res.taskId = o.taskId;
    res.file = o.fileLocation;
    return res;
  }
}

export default AnalysisEventJSONTransformer;
