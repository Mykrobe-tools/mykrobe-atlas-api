import ThirdPartyUploadEventJSONTransformer from "./ThirdPartyUploadEventJSONTransformer";

/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class ThirdPartyUploadCompleteJSONTransformer extends ThirdPartyUploadEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = super.transform(o, options);
    res.event = "Upload via 3rd party complete";
    return res;
  }
}

export default ThirdPartyUploadCompleteJSONTransformer;
