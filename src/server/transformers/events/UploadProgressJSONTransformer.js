import UploadEventJSONTransformer from "./UploadEventJSONTransformer";

import Constants from "../../Constants";

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

    res.event = Constants.EVENTS.UPLOAD_PROGRESS.NAME;

    return res;
  }
}

export default UploadProgressJSONTransformer;
