import axios from "axios";
import config from "../../../config/env";

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
const DNA_VARIANT = "dna-variant";

const DEFAULT_THRESHOLD = 1;

// regexp group indexes
const GENE_INDEX = 1;
const REF_INDEX = 2;
const POS_INDEX = 3;
const ALT_INDEX = 4;

/**
 * Is this a BIGSI query.  BIGSI supports:
 * - sequence search
 * - protein variant search
 * - dna variant search
 *
 * @param {object} query
 * @param {*} options
 */
const isBigsiQuery = (query, options) => {
  const q = query.q;

  if (q && (q.match(SEQUENCE_REGEX) || q.match(PROTEIN_VARIANT_REGEX))) {
    return true;
  }

  return false;
};

/**
 * Create a search query for BIGSI
 *
 * @param {object} query
 * @param {*} options
 */
const extractBigsiQuery = (query, options) => {
  const q = query.q;
  if (q && q.match(SEQUENCE_REGEX)) {
    return extractSequenceQuery(query, options);
  } else if (q && q.match(PROTEIN_VARIANT_REGEX)) {
    return extractProteinVariantQuery(query, options);
  } else {
    return null;
  }
};

/**
 * Create the sequence search query
 *
 * @param {object} query
 * @return {object} sequence query
 */
const extractSequenceQuery = query => {
  const bigsiQuery = {
    type: SEQUENCE,
    query: {}
  };

  if (query.hasOwnProperty("q")) {
    bigsiQuery.query.seq = query.q;
    delete query.q;
  }

  if (query.hasOwnProperty("threshold")) {
    bigsiQuery.query.threshold = Number(query.threshold);
    delete query.threshold;
  } else {
    bigsiQuery.query.threshold = DEFAULT_THRESHOLD;
  }

  return bigsiQuery;
};

/**
 * Create the protein variant search query
 * @param {object} query
 * @param {object} protein variant query
 */
const extractProteinVariantQuery = query => {
  const bigsiQuery = {
    type: PROTEIN_VARIANT,
    query: {}
  };

  if (query.hasOwnProperty("q")) {
    const q = query.q;

    const result = q.match(PROTEIN_VARIANT_REGEX);
    if (result) {
      bigsiQuery.query.gene = result[GENE_INDEX];
      bigsiQuery.query.ref = result[REF_INDEX];
      bigsiQuery.query.pos = parseInt(result[POS_INDEX]);
      bigsiQuery.query.alt = result[ALT_INDEX];

      // use query attribute filter if provided, prioritised over free-text format
      if (query.gene) {
        bigsiQuery.query.gene = query.gene;
        delete query.gene;
      }
      if (query.ref) {
        bigsiQuery.query.ref = query.ref;
        delete query.ref;
      }
      if (query.pos) {
        bigsiQuery.query.pos = query.pos;
        delete query.pos;
      }
      if (query.alt) {
        bigsiQuery.query.alt = query.alt;
        delete query.alt;
      }
    }

    delete query.q;
  }

  return bigsiQuery;
};

/**
 * Call the search endpoint
 * @param {Object} query
 */
const callBigsiApi = async query => {
  try {
    const response = await axios.post(`${config.services.analysisApiUrl}/search`, query);
    return response.data;
  } catch (e) {
    throw e;
  }
};

const bigsi = Object.freeze({
  isBigsiQuery,
  extractBigsiQuery,
  callBigsiApi
});

export default bigsi;
