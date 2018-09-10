import axios from "axios";
import config from "../../config/env";

/**
 * Regex constants
 */
const SEQUENCE_REGEX = /^[ACGT]+$/;
const PROTEIN_VARIANT_REGEX = /([a-zA-Z]+)_([A-Z])([-0-9]+)([A-Z])/;

/**
 * Search types constants
 */
const SEQUENCE = "sequence";
const PROTEIN_VARIANT = "protein-variant";

/**
 * Create the search query
 * @param {string} q
 * @param {*} options
 */
const createQuery = (q, options) => {
  if (q && q.match(SEQUENCE_REGEX)) {
    return sequenceQuery(q, options);
  } else if (q && q.match(PROTEIN_VARIANT_REGEX)) {
    return proteinVariantQuery(q, options);
  } else {
    return null;
  }
};

/**
 * Create the sequence search query
 * @param {string} q
 * @param {*} param1
 */
const sequenceQuery = (q, { threshold = 1, userId }) => {
  return {
    type: SEQUENCE,
    query: {
      seq: q,
      threshold: Number(threshold)
    },
    user_id: userId
  };
};

/**
 * Create the protein variant search query
 * @param {string} q
 * @param {*} param1
 */
const proteinVariantQuery = (q, { userId }) => {
  const result = q.match(PROTEIN_VARIANT_REGEX);
  return {
    type: PROTEIN_VARIANT,
    query: {
      gene: result[1],
      ref: result[2],
      pos: parseInt(result[3]),
      alt: result[4]
    },
    user_id: userId
  };
};

/**
 * Call the search endpoint
 * @param {Object} query
 */
const callApi = async query => {
  try {
    const response = await axios.post(
      `${config.services.analysisApiUrl}/search`,
      query
    );
    return response.data;
  } catch (e) {
    throw e;
  }
};

const bigsiSearch = Object.freeze({
  createQuery,
  callApi
});

export default bigsiSearch;
