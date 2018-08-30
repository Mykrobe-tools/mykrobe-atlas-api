import ResultsJSONTransformer from "./ResultsJSONTransformer";

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class ExperimentResultsPerTypeJSONTransformer {
  /**
   * The transformation engine
   */
  transform(res) {
    const response = {};

    if (res && res.length) {
      res.forEach(result => {
        if (response[result.type]) {
          if (
            new Date(result.analysed) > new Date(response[result.type].analysed)
          ) {
            response[result.type] = result;
          }
        } else {
          response[result.type] = result;
        }
        delete response[result.type].type;
      });

      // transform the latest result
      Object.keys(response).forEach(type => {
        response[type] = new ResultsJSONTransformer().transform(
          response[type],
          {}
        );
      });
    }

    return response;
  }
}

export default ExperimentResultsPerTypeJSONTransformer;
