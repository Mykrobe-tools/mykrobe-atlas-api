/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class UploadEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = { id: options.id };
    res.complete = o.percentageComplete.toFixed(2);
    res.count = o.chunkNumber;
    res.total = o.totalChunks;
    res.file = o.filename;
    return res;
  }
}

export default UploadEventJSONTransformer;
