import axios from "axios";
import config from "../../../config/env";

/**
 * Regex constants
 */
const SEQUENCE_REGEX = /^[ACGT]+$/;
const PROTEIN_VARIANT_REGEX = /([a-zA-Z]+)_([A-Z])([-0-9]+)([A-Z])/;
const DNA_VARIANT_REGEX = /([ACGTX]+)([-0-9]+)([ACGTX]+)/;

/**
 * Search types constants
 */
const SEQUENCE = "sequence";
const PROTEIN_VARIANT = "protein-variant";
const DNA_VARIANT = "dna-variant";

const DEFAULT_THRESHOLD = process.env.DEFAULT_SEQUENCE_THRESHOLD
  ? parseInt(process.env.DEFAULT_SEQUENCE_THRESHOLD)
  : 100;

// regexp group indexes
const PROTEIN_GENE_INDEX = 1;
const PROTEIN_REF_INDEX = 2;
const PROTEIN_POS_INDEX = 3;
const PROTEIN_ALT_INDEX = 4;

const DNA_REF_INDEX = 1;
const DNA_POS_INDEX = 2;
const DNA_ALT_INDEX = 3;

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
  if (isSequenceQuery(query) || isProteinVariantQuery(query) || isDnaVariantQuery(query)) {
    return true;
  }

  return false;
};

/**
 * Is this a DNA variant query.
 *
 * @param {object} query
 * @param {*} options
 */
const isDnaVariantQuery = (query, options) => {
  const q = query.q;

  if (q && q.match(DNA_VARIANT_REGEX)) {
    return true;
  }

  return false;
};

/**
 * Is this a protein variant query.
 *
 * @param {object} query
 * @param {*} options
 */
const isProteinVariantQuery = (query, options) => {
  const q = query.q;

  if (q && q.match(PROTEIN_VARIANT_REGEX)) {
    return true;
  }

  return false;
};

/**
 * Is this a sequence query.
 *
 * @param {object} query
 * @param {*} options
 */
const isSequenceQuery = (query, options) => {
  const q = query.q;

  if (q && q.match(SEQUENCE_REGEX)) {
    return true;
  }

  return false;
};

/**
 * Build a free-text query string for a given type of search
 * @param bigsi
 *
 * @return bigsi query containing free text query
 */
const createQuery = bigsi => {
  const search = {};

  if (bigsi && bigsi.type && bigsi.query) {
    const type = bigsi.type;
    const query = bigsi.query;

    switch (type) {
      case SEQUENCE:
        search.q = `${query.seq}`;
        break;
      case PROTEIN_VARIANT:
        search.q = `${query.gene}_${query.ref}${query.pos}${query.alt}`;
        break;
      case DNA_VARIANT:
        search.q = `${query.ref}${query.pos}${query.alt}`;
        break;
    }
  }

  return search;
};

/**
 * Create a search query for BIGSI
 *
 * @param {object} query
 * @param {*} options
 */
const extractBigsiQuery = (query, options) => {
  if (isSequenceQuery(query)) {
    return extractSequenceQuery(query, options);
  } else if (isProteinVariantQuery(query)) {
    return extractProteinVariantQuery(query, options);
  } else if (isDnaVariantQuery(query)) {
    return extractDnaVariantQuery(query, options);
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
      bigsiQuery.query.gene = result[PROTEIN_GENE_INDEX];
      bigsiQuery.query.ref = result[PROTEIN_REF_INDEX];
      bigsiQuery.query.pos = parseInt(result[PROTEIN_POS_INDEX]);
      bigsiQuery.query.alt = result[PROTEIN_ALT_INDEX];

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
 * Create the dna variant search query
 * @param {object} query
 * @param {object} protein variant query
 */
const extractDnaVariantQuery = query => {
  const bigsiQuery = {
    type: DNA_VARIANT,
    query: {}
  };

  if (query.hasOwnProperty("q")) {
    const q = query.q;

    const result = q.match(DNA_VARIANT_REGEX);
    if (result) {
      bigsiQuery.query.ref = result[DNA_REF_INDEX];
      bigsiQuery.query.pos = parseInt(result[DNA_POS_INDEX]);
      bigsiQuery.query.alt = result[DNA_ALT_INDEX];

      // use query attribute filter if provided, prioritised over free-text format
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
  createQuery,
  callBigsiApi
});

export default bigsi;
