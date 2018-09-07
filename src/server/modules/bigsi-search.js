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
const sequenceQuery = (q, { threshold = 1, userId, resultId }) => {
  return {
    type: SEQUENCE,
    query: {
      seq: q,
      threshold
    },
    user_id: userId,
    result_id: resultId
  };
};

/**
 * Create the protein variant search query
 * @param {string} q
 * @param {*} param1
 */
const proteinVariantQuery = (q, { userId, resultId }) => {
  const result = q.match(PROTEIN_VARIANT_REGEX);
  return {
    type: PROTEIN_VARIANT,
    query: {
      gene: result[1],
      ref: result[2],
      pos: result[3],
      alt: result[4]
    },
    user_id: userId,
    result_id: resultId
  };
};

const bigsiSearch = Object.freeze({
  createQuery
});

export default bigsiSearch;
