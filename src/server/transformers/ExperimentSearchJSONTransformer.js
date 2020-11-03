import ExperimentJSONTransformer from "./ExperimentJSONTransformer";

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class ExperimentSearchJSONTransformer extends ExperimentJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options = {}) {
    let res = super.transform(o, options);

    if (res.results && res.results.phylogenetics) {
      // delete unmapped fields so they are not indexed for search
      if (res.results.phylogenetics.lineage && res.results.phylogenetics.lineage.calls) {
        delete res.results.phylogenetics.lineage.calls;
      }
      if (res.results.phylogenetics.lineage && res.results.phylogenetics.lineage.calls_summary) {
        delete res.results.phylogenetics.lineage.calls_summary;
      }
    }

    return res;
  }
}

export default ExperimentSearchJSONTransformer;
