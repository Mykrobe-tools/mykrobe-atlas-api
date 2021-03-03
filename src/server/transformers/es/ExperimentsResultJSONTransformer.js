import ElasticsearchJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/ElasticsearchJSONTransformer";
import HitsJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/HitsJSONTransformer";

import logger from "../../modules/logging/logger";
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
  transform(o, options = {}) {
    const res = super.transform(o, options);

    const hits = new HitsJSONTransformer().transform(res, options);
    return hits.map(element => {
      const source = element && element._source ? element._source : null;
      const ownership = {};
      if (options.currentUser) {
        const currentUser = options.currentUser;
        logger.debug(
          `ExperimentsResultJSONTransformer#transform: currentUser: ${JSON.stringify(currentUser)}`
        );

        // check the current user is the record owner
        const owner = source.owner ? source.owner : null;
        ownership.public = owner ? false : true;

        logger.debug(
          `ExperimentsResultJSONTransformer#transform: ${JSON.stringify(
            currentUser && currentUser.id ? currentUser.id : "undefined"
          )} = ${JSON.stringify(owner && owner.id ? owner.id : "undefined")}`
        );
        ownership.owner = owner && currentUser.id === owner.id;
      } else {
        logger.debug(`ExperimentsResultJSONTransformer#transform: No currentUser`);
        if (source.owner) {
          logger.debug(`ExperimentsResultJSONTransformer#transform: Has owner`);
          ownership.public = false;
          ownership.owner = false;
        } else {
          ownership.public = true;
          ownership.owner = false;
        }
      }

      logger.debug(
        `ExperimentsResultJSONTransformer#transform: ownership: ${JSON.stringify(ownership)}`
      );

      const core = {
        ...source,
        relevance: element._score
      };

      return Object.assign({}, core, ownership);
    });
  }
}

export default ExperimentsResultJSONTransformer;
