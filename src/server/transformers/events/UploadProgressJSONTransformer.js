import UploadEventJSONTransformer from "./UploadEventJSONTransformer";

/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class UploadProgressJSONTransformer extends UploadEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = super.transform(o, options);
    res.event = "Upload progress";
    return res;
  }
}

export default UploadProgressJSONTransformer;
