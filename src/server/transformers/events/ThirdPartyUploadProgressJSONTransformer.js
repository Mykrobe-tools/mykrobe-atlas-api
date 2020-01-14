import ThirdPartyUploadEventJSONTransformer from "./ThirdPartyUploadEventJSONTransformer";

import Constants from "../../Constants";

/**
 * A class to transform event payloads
 * @property response : the response Object from mongoose
 */
class ThirdPartyUploadProgressJSONTransformer extends ThirdPartyUploadEventJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options) {
    const res = super.transform(o, options);

    res.event = Constants.EVENTS.THIRD_PARTY_UPLOAD_PROGRESS.NAME;

    return res;
  }
}

export default ThirdPartyUploadProgressJSONTransformer;
