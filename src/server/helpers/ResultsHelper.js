const SUSCEPTIBILITY = "susceptibility";
const PHYLOGENETICS = "phylogenetics";
const VARIANT_CALLS = "variant_calls";
const SEQUENCE_CALLS = "sequence_calls";
const KMER = "kmer";
const PROBE_SETS = "probe_sets";
const FILES = "files";
const VERSION = "version";
const GENOTYPE_MODEL = "genotype_model";
const PREDICT = "predict";
const CALLED_BY = "called_by";
const RESISTANT = "R";
const PERCENT_COVERAGE = "percent_coverage";
const MEDIAN_DEPTH = "median_depth";

class ResultsHelper {
  static parse(predictorNamedResult) {
    const result = {};
    if (predictorNamedResult) {
      const predictorResult = this.getPredictorResult(predictorNamedResult);

      if (predictorResult) {
        const keys = Object.keys(predictorResult);
        for (var i = 0; i < keys.length; i++) {
          // use oldschool loop for performance
          const attribute = keys[i];
          switch (attribute) {
            case SUSCEPTIBILITY:
              result.susceptibility = this.parseSusceptibility(
                predictorResult[attribute]
              );
              break;
            case PHYLOGENETICS:
              result.phylogenetics = this.parsePhylogenetics(
                predictorResult[attribute]
              );
              break;
            case VARIANT_CALLS:
              result.variantCalls = predictorResult[attribute];
              break;
            case SEQUENCE_CALLS:
              result.sequenceCalls = predictorResult[attribute];
              break;
            case KMER:
              result.kmer = predictorResult[attribute];
              break;
            case PROBE_SETS:
              result.probeSets = predictorResult[attribute];
              break;
            case FILES:
              result.files = predictorResult[attribute];
              break;
            case VERSION:
              result.version = predictorResult[attribute];
              break;
            case GENOTYPE_MODEL:
              result.genotypeModel = predictorResult[attribute];
              break;
          }
        }
      }
    }

    return result;
  }

  /**
   * Extract the results from a result object
   * {
   *   someName: { .. result here .. }
   * }
   * @param {object} predictorNamedResult
   * @return {object} result
   */
  static getPredictorResult(predictorNamedResult) {
    let predictorResult = null;
    if (predictorNamedResult) {
      // assumption is there is only one wrapping name in predictor results
      const keys = Object.keys(predictorNamedResult);
      if (keys && keys.length) {
        const first = keys[0];
        return predictorNamedResult[first];
      }
    }
    return predictorResult;
  }

  /**
   * Parse a susceptibility sub schema and reshape it to store in the db
   * @param {object} predictorSusceptibility
   * @return {array} susceptibility
   */
  static parseSusceptibility(predictorSusceptibility) {
    const susceptibility = [];
    if (predictorSusceptibility) {
      Object.keys(predictorSusceptibility).forEach(drug => {
        const drugSusceptibility = {
          name: drug
        };

        const results = predictorSusceptibility[drug];
        const prediction = results[PREDICT];
        if (prediction) {
          drugSusceptibility.prediction = prediction;
          if (prediction === RESISTANT) {
            drugSusceptibility.calledBy = results[CALLED_BY];
          }
        }

        susceptibility.push(drugSusceptibility);
      });
    }
    return susceptibility;
  }

  /**
   * Parse a phylogenetics sub schema and reshape it to store in the db
   * @param {object} predictorPhylogenetics
   * @return {array} phylogenetics
   */
  static parsePhylogenetics(predictorPhylogenetics) {
    const phylogenetics = [];

    if (predictorPhylogenetics) {
      Object.keys(predictorPhylogenetics).forEach(type => {
        const results = predictorPhylogenetics[type];
        Object.keys(results).forEach(result => {
          const typePhylogenetics = {
            type: type
          };
          typePhylogenetics.result = result;
          typePhylogenetics.percentCoverage = results[result][PERCENT_COVERAGE];
          typePhylogenetics.medianDepth = results[result][MEDIAN_DEPTH];

          phylogenetics.push(typePhylogenetics);
        });
      });
    }

    return phylogenetics;
  }
}

export default ResultsHelper;
