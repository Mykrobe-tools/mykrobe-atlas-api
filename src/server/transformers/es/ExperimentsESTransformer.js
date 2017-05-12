import HitsESTransformer from './HitsESTransformer';

/**
 * A class to transform es responses
 * @property response : the response Object from es
 */
class ExperimentsESTransformer extends HitsESTransformer {
  /**
   * The transformation engine
   */
  transform() {
    const res = super.transform();
    if (!Array.isArray(res)) {
      res.results = res.results.map(element => element._source);
      return res;
    }
    return res.map(element => element._source);
  }
}

export default ExperimentsESTransformer;
