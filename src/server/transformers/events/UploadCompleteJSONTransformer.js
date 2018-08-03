import UploadEventJSONTransformer from "./UploadEventJSONTransformer";

/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class UploadCompleteJSONTransformer extends UploadEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = super.transform(o, options);
    res.event = "Upload complete";
    return res;
  }
}

export default UploadCompleteJSONTransformer;
