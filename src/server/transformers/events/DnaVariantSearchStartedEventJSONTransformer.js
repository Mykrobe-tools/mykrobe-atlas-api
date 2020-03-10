import SearchEventJSONTransformer from "./SearchEventJSONTransformer";

import Constants from "../../Constants";

/**
 * A class to transform a DNA variant started payload
 */
class DnaVariantSearchStartedEventJSONTransformer extends SearchEventJSONTransformer {
  /**
   * Transform the object
   * @param {object} o the object to transform
   * @param {object} options to control the transformation
   *
   * @return {object} the transformed object
   */
  transform(o, options) {
    const res = super.transform(o, options);

    res.event = Constants.EVENTS.DNA_VARIANT_SEARCH_STARTED.NAME;

    return res;
  }
}

export default DnaVariantSearchStartedEventJSONTransformer;
