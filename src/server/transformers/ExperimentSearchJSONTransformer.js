import ExperimentJSONTransformer from "./ExperimentJSONTransformer";

import logger from "../modules/logger";

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
    logger.debug(`ExperimentSearchJSONTransformer: enter`);

    // delete unmapped fields so they are not indexed for search
    if (
      res.results &&
      res.results.predictor &&
      res.results.predictor.phylogenetics &&
      res.results.predictor.phylogenetics.lineage
    ) {
      const lineage = {
        lineage: res.results.predictor.phylogenetics.lineage.lineage
      };
      res.results.predictor.phylogenetics.lineage = lineage;
    }

    logger.debug(`ExperimentSearchJSONTransformer: exit`);

    return res;
  }
}

export default ExperimentSearchJSONTransformer;
