/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class UploadEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = {};

    const { status, experiment } = o;

    if (experiment) {
      res.id = experiment.id;
    }

    if (status) {
      if (status.percentageComplete) {
        res.complete = status.percentageComplete.toFixed(2);
      }
      res.count = status.chunkNumber;
      res.total = status.totalChunks;
      res.file = status.filename;
    }

    return res;
  }
}

export default UploadEventJSONTransformer;
