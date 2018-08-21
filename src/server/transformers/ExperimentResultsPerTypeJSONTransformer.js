import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class ExperimentResultsPerTypeJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o) {
    const response = {};
    let res = super.transform(o, {});

    if (res && res.length) {
      res.sort((a, b) => new Date(a.analysed) - new Date(b.analysed));
      res.forEach(result => {
        response[result.type] = result;
        delete response[result.type].type;
      });
    }

    return response;
  }
}

export default ExperimentResultsPerTypeJSONTransformer;
