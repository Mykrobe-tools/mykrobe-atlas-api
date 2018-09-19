import SearchEventJSONTransformer from "./SearchEventJSONTransformer";

/**
 * A class to transform a protein variant started payload
 */
class ProteinVariantSearchStartedEventJSONTransformer extends SearchEventJSONTransformer {
  /**
   * Transform the object
   * @param {object} o the object to transform
   * @param {object} options to control the transformation
   *
   * @return {object} the transformed object
   */
  transform(o, options) {
    const res = super.transform(o, options);

    res.event = "Protein variant search started";

    return res;
  }
}

export default ProteinVariantSearchStartedEventJSONTransformer;
