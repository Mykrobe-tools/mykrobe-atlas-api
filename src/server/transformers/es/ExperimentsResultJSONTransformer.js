import ElasticsearchJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/ElasticsearchJSONTransformer";
import HitsJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/HitsJSONTransformer";

/**
 * Translate an elasticsearch response onto an Experiment response
 */
class ExperimentsResultJSONTransformer extends ElasticsearchJSONTransformer {
  /**
   * Convert an elasticsearch respose to a Experiment
   *
   * @param {object} o the elasticsearch result
   * @return {object} an experiment like object
   */
  transform(o, options) {
    const res = super.transform(o, options);

    const hits = new HitsJSONTransformer().transform(res, options);
    return hits.map(element => {
      return {
        ...element._source,
        relevance: element._score
      };
    });
  }
}

export default ExperimentsResultJSONTransformer;
