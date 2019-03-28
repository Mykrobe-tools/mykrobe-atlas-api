import Experiment from "../models/experiment.model";

const EXTERNAL_ID = "external_id";
const PREDICT = "predict";
const RESISTANT = "R";
const CALLED_BY = "called_by";
const PERCENT_COVERAGE = "percent_coverage";
const MEDIAN_DEPTH = "median_depth";

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
    if (drugResistance[drug] && drugResistance[drug] === RESISTANT) {
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
    if (drugResistance[drug] && drugResistance[drug] !== RESISTANT) {
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
  drugResistance[ISONIAZID] === RESISTANT && drugResistance[RIFAMPICIN] === RESISTANT;

/**
 * Calculate XDR value
 * @param {*} drugResistance
 */
const calculateXDR = drugResistance =>
  drugResistance[ISONIAZID] === RESISTANT &&
  drugResistance[RIFAMPICIN] === RESISTANT &&
  drugResistance[QUINOLONES] === RESISTANT &&
  (drugResistance[AMIKACIN] === RESISTANT ||
    drugResistance[CAPREOMYCIN] === RESISTANT ||
    drugResistance[KANAMYCIN] === RESISTANT);

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
      namedResult[EXTERNAL_ID] = first;
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
};

const calculateResistantAttributes = susceptibility => {
  let resistance = {};

  if (susceptibility) {
    const drugResistance = buildDrugResistance(susceptibility);
    resistance.r = calculateResistance(drugResistance);
    resistance.mdr = calculateMDR(drugResistance);
    resistance.xdr = calculateXDR(drugResistance);
    resistance.tdr = calculateTDR(drugResistance);
  }

  return resistance;
};

const calculateNearestNeighbours = nearestNeighboursResult => {
  const nearestNeighbours = [];
  Object.keys(nearestNeighboursResult).forEach(key => {
    nearestNeighbours.push({
      id: key,
      distance: nearestNeighboursResult[key]
    });
  });
  return nearestNeighbours;
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
  calculateResistantAttributes,
  getPredictorResult,
  parseSusceptibility,
  parsePhylogenetics,
  calculateNearestNeighbours,
  buildRandomDistanceResult
});

export default resultsUtil;
