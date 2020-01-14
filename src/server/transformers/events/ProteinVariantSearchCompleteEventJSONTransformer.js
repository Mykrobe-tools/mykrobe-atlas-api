import SearchEventJSONTransformer from "./SearchEventJSONTransformer";

import Constants from "../../Constants";

/**
 * A class to transform a protein variant started payload
 */
class ProteinVariantSearchCompleteEventJSONTransformer extends SearchEventJSONTransformer {
  /**
   * Transform the object
   * @param {object} o the object to transform
   * @param {object} options to control the transformation
   *
   * @return {object} the transformed object
   */
  transform(o, options) {
    const res = super.transform(o, options);

    res.event = Constants.EVENTS.PROTEIN_VARIANT_SEARCH_COMPLETE.NAME;

    return res;
  }
}

export default ProteinVariantSearchCompleteEventJSONTransformer;
