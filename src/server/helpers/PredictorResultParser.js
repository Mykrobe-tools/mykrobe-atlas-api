import {
  calculateResistantAttributes,
  getPredictorResult,
  parseSusceptibility,
  parsePhylogenetics
} from "../modules/resultsUtil";

const SUSCEPTIBILITY = "susceptibility";
const PHYLOGENETICS = "phylogenetics";
const VARIANT_CALLS = "variant_calls";
const SEQUENCE_CALLS = "sequence_calls";
const KMER = "kmer";
const PROBE_SETS = "probe_sets";
const FILES = "files";
const VERSION = "version";
const GENOTYPE_MODEL = "genotype_model";
const EXTERNAL_ID = "external_id";
const ANALYSED = "analysed";

class PredictorResultParser {
  constructor(namedResult) {
    this.namedResult = namedResult;
  }

  parse() {
    const result = {
      type: "predictor",
      received: new Date()
    };
    if (this.namedResult.result) {
      const predictorResult = getPredictorResult(this.namedResult.result);
      if (predictorResult) {
        const keys = Object.keys(predictorResult);
        for (var i = 0; i < keys.length; i++) {
          // use oldschool loop for performance
          const attribute = keys[i];
          switch (attribute) {
            case SUSCEPTIBILITY:
              result.susceptibility = parseSusceptibility(
                predictorResult[attribute]
              );
              break;
            case PHYLOGENETICS:
              result.phylogenetics = parsePhylogenetics(
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
            case EXTERNAL_ID:
              result.externalId = predictorResult[attribute];
              break;
            case ANALYSED:
              result.analysed = new Date();
              break;
          }
        }
        const resistantAttributes = calculateResistantAttributes(
          result.susceptibility
        );

        Object.assign(result, resistantAttributes);
      }
    }

    return result;
  }
}

export default PredictorResultParser;
