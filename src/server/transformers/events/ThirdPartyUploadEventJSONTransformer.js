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
    const res = { id: options.id };
    const totalSize = parseInt(o.totalSize);
    const complete = o.size * 100 / totalSize;

    res.provider = o.provider;
    res.complete = complete.toFixed(2);
    res.size = o.size;
    res.totalSize = totalSize;
    res.file = path.basename(o.fileLocation);
    return res;
  }
}

export default ThirdPartyUploadEventJSONTransformer;
