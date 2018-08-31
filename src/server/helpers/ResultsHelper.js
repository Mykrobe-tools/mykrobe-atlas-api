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
const EXTERNAL_ID = "external_id";
const ANALYSED = "analysed";
// drug names
const ISONIAZID = "Isoniazid";
const RIFAMPICIN = "Rifampicin";
const QUINOLONES = "Quinolones";
const AMIKACIN = "Amikacin";
const CAPREOMYCIN = "Capreomycin";
const KANAMYCIN = "Kanamycin";
const ETHAMBUTOL = "Ethambutol";
const STREPTOMYCIN = "Streptomycin";
const PYRAZINAMIDE = "Pyrazinamide";
const ALL_DRUGS = [
  ISONIAZID,
  RIFAMPICIN,
  QUINOLONES,
  AMIKACIN,
  CAPREOMYCIN,
  KANAMYCIN,
  ETHAMBUTOL,
  STREPTOMYCIN,
  PYRAZINAMIDE
];

/**
 * Caluclate the resistance per drug
 * @param {*} susceptibility
 */
const buildDrugResistance = susceptibility => {
  const drugResistance = {};
  susceptibility.forEach(drug => {
    drugResistance[drug.name] = drug.prediction;
  });
  return drugResistance;
};

/**
 * Caluclate the resistance
 * @param {*} susceptibility
 */
const calculateResistance = drugResistance => {
  let r = false;
  ALL_DRUGS.forEach(drug => {
    if (drugResistance[drug] && drugResistance[drug] === "R") {
      r = true;
    }
  });
  return r;
};

/**
 * Caluclate the TDR
 * @param {*} susceptibility
 */
const calculateTDR = drugResistance => {
  let tdr = true;
  ALL_DRUGS.forEach(drug => {
    if (drugResistance[drug] && drugResistance[drug] !== "R") {
      tdr = false;
    }
  });
  return tdr;
};

/**
 * Calculate MDR value
 * @param {*} drugResistance
 */
const calculateMDR = drugResistance =>
  drugResistance[ISONIAZID] === "R" && drugResistance[RIFAMPICIN] === "R";

/**
 * Calculate XDR value
 * @param {*} drugResistance
 */
const calculateXDR = drugResistance =>
  drugResistance[ISONIAZID] === "R" &&
  drugResistance[RIFAMPICIN] === "R" &&
  drugResistance[QUINOLONES] === "R" &&
  (drugResistance[AMIKACIN] === "R" ||
    drugResistance[CAPREOMYCIN] === "R" ||
    drugResistance[KANAMYCIN] === "R");

class ResultsHelper {
  static parse(predictorNamedResult) {
    const result = {
      type: "predictor",
      received: new Date()
    };
    if (predictorNamedResult.result) {
      const predictorResult = this.getPredictorResult(
        predictorNamedResult.result
      );
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
            case EXTERNAL_ID:
              result.externalId = predictorResult[attribute];
              break;
            case ANALYSED:
              result.analysed = new Date();
              break;
          }
        }
        const resistantAttributes = this.calculateResistantAttributes(
          result.susceptibility
        );

        Object.assign(result, resistantAttributes);
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
        const namedResult = predictorNamedResult[first];
        namedResult[EXTERNAL_ID] = first;
        return namedResult;
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

  static calculateResistantAttributes(susceptibility) {
    let resistance = {};

    if (susceptibility) {
      const drugResistance = buildDrugResistance(susceptibility);
      resistance.r = calculateResistance(drugResistance);
      resistance.mdr = calculateMDR(drugResistance);
      resistance.xdr = calculateXDR(drugResistance);
      resistance.tdr = calculateTDR(drugResistance);
    }

    return resistance;
  }
}

export default ResultsHelper;
