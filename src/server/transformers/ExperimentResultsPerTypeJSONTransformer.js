import ResultsJSONTransformer from "./ResultsJSONTransformer";

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class ExperimentResultsPerTypeJSONTransformer {
  /**
   * The transformation engine
   */
  transform(res, options = {}) {
    const response = {};

    if (res && res.length) {
      res.forEach(result => {
        if (result) {
          const type = [result.type, result.subType].filter(Boolean).join("-");
          // only return the most recent result
          if (response[type]) {
            if (new Date(result.analysed) > new Date(response[type].analysed)) {
              response[type] = result;
            }
          } else {
            response[type] = result;
          }
        }
      });

      // transform the latest result
      Object.keys(response).forEach(type => {
        response[type] = new ResultsJSONTransformer().transform(response[type], options);
      });
    }

    return response;
  }
}

export default ExperimentResultsPerTypeJSONTransformer;
