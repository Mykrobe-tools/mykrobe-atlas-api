import ESTransformer from "./ESTransformer";

/**
 * A class to transform es responses
 * @property response : the response Object from es
 */
class RangesESTransformer extends ESTransformer {
  transform() {
    const res = super.transform();
    let { o, key } = this.options;
    const range = key.startsWith("min_") ? "min" : "max";
    key = key.substring(4);
    o[`${key}`] = o[`${key}`] || {};
    o[`${key}`][`${range}`] = res.value_as_string || res.value;
  }
}

export default RangesESTransformer;
