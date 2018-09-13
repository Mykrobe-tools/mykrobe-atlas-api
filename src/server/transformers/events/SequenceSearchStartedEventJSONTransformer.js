import SearchEventJSONTransformer from "./SearchEventJSONTransformer";

/**
 * A class to transform a sequence started payload
 */
class SequenceSearchStartedEventJSONTransformer extends SearchEventJSONTransformer {
  /**
   * Transform the object
   * @param {object} o the object to transform
   * @param {object} options to control the transformation
   *
   * @return {object} the transformed object
   */
  transform(o, options) {
    const res = super.transform(o, options);

    res.event = "Sequence search started";

    return res;
  }
}

export default SequenceSearchStartedEventJSONTransformer;
