import Constants from "../../Constants";
import Experiment from "../../models/experiment.model";

/**
 * Calculate the resistance per drug
 * @param {*} susceptibility
 */
const buildDrugResistanceSummary = susceptibility => {
  const drugResistance = {};
  susceptibility.forEach(drug => {
    drugResistance[drug.name] = drug.prediction;
  });
  return drugResistance;
};

/**
 * Calculate resistance
 * - resistant to a drug
 * @param {*} susceptibility
 */
const calculateResistance = drugResistance =>
  typeof drugResistance !== "undefined" &&
  drugResistance !== null &&
  drugResistance &&
  Constants.ALL_DRUGS.some(
    drug => drugResistance[drug] && drugResistance[drug] === Constants.RESISTANT
  );

/**
 * Calculate MDR value
 * - resistant to all first-line-drugs
 * @param {*} drugResistance
 */
const calculateMDR = drugResistance =>
  typeof drugResistance !== "undefined" &&
  drugResistance !== null &&
  drugResistance &&
  Constants.FIRST_LINE_DRUGS.every(
    drug => drugResistance[drug] && drugResistance[drug] === Constants.RESISTANT
  );

/**
 * Calculate XDR value
 * - resistant to all first-line drugs
 * - resistant to one quinolone
 * - resistant to one second-line drug
 * @param {*} drugResistance
 */
const calculateXDR = drugResistance =>
  typeof drugResistance !== "undefined" &&
  drugResistance !== null &&
  drugResistance &&
  Constants.FIRST_LINE_DRUGS.every(
    drug => drugResistance[drug] && drugResistance[drug] === Constants.RESISTANT
  ) &&
  Constants.QUINOLONES.some(
    drug => drugResistance[drug] && drugResistance[drug] === Constants.RESISTANT
  ) &&
  Constants.SECOND_LINE_DRUGS.some(
    drug => drugResistance[drug] && drugResistance[drug] === Constants.RESISTANT
  );

/**
 * Calculate TDR
 * - resistant to all drugs
 * @param {*} susceptibility
 */
const calculateTDR = drugResistance =>
  typeof drugResistance !== "undefined" &&
  drugResistance !== null &&
  drugResistance &&
  Constants.ALL_DRUGS.every(
    drug => drugResistance[drug] && drugResistance[drug] === Constants.RESISTANT
  );

/**
 * Extract the results from a result object
 * {
 *   someName: { .. result here .. }
 * }
 * @param {object} predictorNamedResult
 * @return {object} result
 */
const getPredictorResult = predictorNamedResult => {
  let predictorResult = null;
  if (predictorNamedResult) {
    // assumption is there is only one wrapping name in predictor results
    const keys = Object.keys(predictorNamedResult);
    if (keys && keys.length) {
      const first = keys[0];
      const namedResult = predictorNamedResult[first];
      namedResult[Constants.EXTERNAL_ID] = first;
      return namedResult;
    }
  }
  return predictorResult;
};

/**
 * Parse a susceptibility sub schema and reshape it to store in the db
 * @param {object} predictorSusceptibility
 * @return {array} susceptibility
 */
const parseSusceptibility = predictorSusceptibility => {
  const susceptibility = [];
  if (predictorSusceptibility) {
    Object.keys(predictorSusceptibility).forEach(drug => {
      const drugSusceptibility = {
        name: drug
      };

      const results = predictorSusceptibility[drug];
      const prediction = results[Constants.PREDICT];
      if (prediction) {
        drugSusceptibility.prediction = prediction.toUpperCase();
        if (prediction === Constants.RESISTANT) {
          drugSusceptibility.calledBy = results[Constants.CALLED_BY];
        }
      }

      susceptibility.push(drugSusceptibility);
    });
  }
  return susceptibility;
};

/**
 * Parse a phylogenetics sub schema and reshape it to store in the db
 * @param {object} predictorPhylogenetics
 * @return {array} phylogenetics
 */
const parsePhylogenetics = predictorPhylogenetics => {
  const phylogenetics = [];

  if (predictorPhylogenetics) {
    Object.keys(predictorPhylogenetics).forEach(type => {
      const results = predictorPhylogenetics[type];
      Object.keys(results).forEach(result => {
        const typePhylogenetics = {
          type,
          result
        };

        if (results[result][Constants.PERCENT_COVERAGE]) {
          typePhylogenetics.percentCoverage = results[result][Constants.PERCENT_COVERAGE];
        }
        if (results[result][Constants.MEDIAN_DEPTH]) {
          typePhylogenetics.medianDepth = results[result][Constants.MEDIAN_DEPTH];
        }
        if (result === Constants.LINEAGE) {
          typePhylogenetics.lineage = results[result];
        }
        if (result === Constants.CALLS_SUMMARY) {
          typePhylogenetics.callsSummary = results[result];
        }
        if (result === Constants.CALLS) {
          typePhylogenetics.calls = results[result];
        }

        phylogenetics.push(typePhylogenetics);
      });
    });
  }

  return phylogenetics;
};

const calculateResistanceAttributes = susceptibility => {
  let resistance = {};

  if (susceptibility) {
    const drugResistance = buildDrugResistanceSummary(susceptibility);
    resistance.r = calculateResistance(drugResistance);
    resistance.mdr = calculateMDR(drugResistance);
    resistance.xdr = calculateXDR(drugResistance);
    resistance.tdr = calculateTDR(drugResistance);
  }

  return resistance;
};

const parseDistance = result => {
  if (result && Array.isArray(result)) {
    return result;
  }
  return [];
};

const buildRandomDistanceResult = async () => {
  const result = {};
  const experiments = await Experiment.list(5);

  experiments.forEach(experiment => {
    result[experiment.id] = Math.floor(Math.random() * 20) + 1;
  });

  return {
    type: "distance",
    result
  };
};

const resultsUtil = Object.freeze({
  buildDrugResistanceSummary,
  calculateResistanceAttributes,
  calculateResistance,
  calculateMDR,
  calculateXDR,
  calculateTDR,
  getPredictorResult,
  parseSusceptibility,
  parsePhylogenetics,
  parseDistance,
  buildRandomDistanceResult
});

export default resultsUtil;
