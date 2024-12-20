import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";
import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";

const BLACKLIST = ["__v"];

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class AuditJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o) {
    let res = super.transform(o, {});

    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });

    // mirror properties - no properties are boolean so truthy check is OK
    [
      "taskId",
      "experimentId",
      "searchId",
      "userId",
      "requestMethod",
      "requestUri",
      "fileLocation",
      "status",
      "type",
      "attempt"
    ].forEach(key => {
      if (o[key]) {
        res[key] = o[key];
      }
    });

    return res;
  }
}

export default AuditJSONTransformer;
