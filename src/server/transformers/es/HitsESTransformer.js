import ESTransformer from './ESTransformer';
import SummaryESTransformer from './SummaryESTransformer';

/**
 * A class to transform es responses
 * @property response : the response Object from es
 */
class HitsESTransformer extends ESTransformer {
  transform() {
    const res = super.transform();
    if (this.options.includeSummary) {
      const transformer = new SummaryESTransformer(res);
      const summary = transformer.transform();
      const results = res.hits.hits;
      return Object.assign({ summary }, { results });
    }
    return res.hits.hits;
  }
}

export default HitsESTransformer;
