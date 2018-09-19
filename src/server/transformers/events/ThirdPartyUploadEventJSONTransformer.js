import path from "path";

/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class ThirdPartyUploadEventJSONTransformer {
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
      const totalSize = parseInt(status.totalSize);
      const complete = status.size * 100 / totalSize;

      res.provider = status.provider;
      res.complete = complete.toFixed(2);
      res.size = status.size;
      res.totalSize = totalSize;
      res.file = path.basename(status.fileLocation);
    }

    return res;
  }
}

export default ThirdPartyUploadEventJSONTransformer;
