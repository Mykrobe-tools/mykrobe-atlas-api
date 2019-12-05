import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";
import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";

const BLACKLIST = ["__v", "_id"];

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class EventJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options = {}) {
    if (!o) {
      return {};
    }

    let res = super.transform(o, options);
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });

    if (res.openUploads) {
      res.openUploads = res.openUploads.map(upload =>
        new BlacklistTransformer().transform(upload, { blacklist: BLACKLIST })
      );
    }

    if (res.openAnalysis) {
      res.openAnalysis = res.openAnalysis.map(analysis =>
        new BlacklistTransformer().transform(analysis, { blacklist: BLACKLIST })
      );
    }

    if (res.openSearches) {
      res.openSearches = res.openSearches.map(search =>
        new BlacklistTransformer().transform(search, { blacklist: BLACKLIST })
      );
    }

    return res;
  }
}

export default EventJSONTransformer;
