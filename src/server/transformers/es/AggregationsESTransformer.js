import ESTransformer from "./ESTransformer";

/**
 * A class to transform es responses
 * @property response : the response Object from es
 */
class AggregationsESTransformer extends ESTransformer {
  transform() {
    const res = super.transform();
    return res.aggregations;
  }
}

export default AggregationsESTransformer;
