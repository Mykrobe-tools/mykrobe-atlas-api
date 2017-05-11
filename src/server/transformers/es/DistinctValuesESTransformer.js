import AggregationsESTransformer from './AggregationsESTransformer';

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
    return res.map(element => element.key);
  }
}

export default DistinctValuesESTransformer;
