export default {
  SEARCH_PENDING: "pending",
  SEARCH_COMPLETE: "complete",

  DEFAULT_SEARCH_EXPIRY_DAYS: 3,
  DISTANCE_PROJECTION: {
    _id: 1,
    "metadata.sample.isolateId": 1,
    "metadata.sample.longitudeIsolate": 1,
    "metadata.sample.latitudeIsolate": 1
  },

  EXPERIMENTS_URL: "/experiments/search",
  EXPERIMENTS_CHOICES_URL: "/experiments/choices",

  SEARCH_URL_SUFFIX: "/search",
  EXPERIMENTS_URL_SUFFIX: "/experiments",
  CHOICES_URL_SUFFIX: "/choices",

  INDEX_TYPE: "experiment",

  // Error codes
  ERRORS: {
    INVALID_CREDENTIALS: 10002,
    ROUTE_NOT_FOUND: 10001,
    VALIDATION_ERROR: 10003,
    RUNTIME_ERROR: 10004,
    INVALID_USERNAME: 10009,
    CREATE_USER: 10005,
    LOAD_USER: 10007,
    GET_SWAGGER_DOC: 10023,
    OBJECT_NOT_FOUND: 10024
  },

  EVENTS: {
    ANALYSIS_STARTED: {
      EVENT: "analysis-started",
      NAME: "Analysis started"
    },
    ANALYSIS_COMPLETE: {
      EVENT: "analysis-complete",
      NAME: "Analysis complete"
    },
    DISTANCE_SEARCH_STARTED: {
      EVENT: "distance-search-started",
      NAME: "Distance search started"
    },
    DISTANCE_SEARCH_COMPLETE: {
      EVENT: "distance-search-complete",
      NAME: "Distance search complete"
    },
    PROTEIN_VARIANT_SEARCH_STARTED: {
      EVENT: "protein-variant-search-started",
      NAME: "Protein variant search started"
    },
    PROTEIN_VARIANT_SEARCH_COMPLETE: {
      EVENT: "protein-variant-search-complete",
      NAME: "Protein variant search complete"
    },
    DNA_VARIANT_SEARCH_STARTED: {
      EVENT: "dna-variant-search-started",
      NAME: "Protein variant search started"
    },
    DNA_VARIANT_SEARCH_COMPLETE: {
      EVENT: "dna-variant-search-complete",
      NAME: "Protein variant search complete"
    },
    SEQUENCE_SEARCH_STARTED: {
      EVENT: "sequence-search-started",
      NAME: "Sequence search started"
    },
    SEQUENCE_SEARCH_COMPLETE: {
      EVENT: "sequence-search-complete",
      NAME: "Sequence search complete"
    },
    THIRD_PARTY_UPLOAD_PROGRESS: {
      EVENT: "3rd-party-upload-progress",
      NAME: "Upload via 3rd party progress"
    },
    THIRD_PARTY_UPLOAD_COMPLETE: {
      EVENT: "3rd-party-upload-complete",
      NAME: "Upload via 3rd party complete"
    },
    UPLOAD_PROGRESS: {
      EVENT: "upload-progress",
      NAME: "Upload progress"
    },
    UPLOAD_COMPLETE: {
      EVENT: "upload-complete",
      NAME: "Upload complete"
    }
  }
};
