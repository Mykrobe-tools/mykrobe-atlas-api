import ESTransformer from "./ESTransformer";

/**
 * A class to transform es responses
 * @property response : the response Object from es
 */
class SummaryESTransformer extends ESTransformer {
  transform() {
    const res = super.transform();
    return { hits: res.hits.total };
  }
}

export default SummaryESTransformer;
