import AggregationsESTransformer from "./AggregationsESTransformer";

/**
 * A class to transform es responses
 * @property response : the response Object from es
 */
class DistinctValuesESTransformer extends AggregationsESTransformer {
  /**
   * The transformation engine
   */
  transform() {
    const res = super.transform();
    const mapped = res.map(element => element.key);
    console.log(mapped);
    return mapped;
  }
}

export default DistinctValuesESTransformer;
