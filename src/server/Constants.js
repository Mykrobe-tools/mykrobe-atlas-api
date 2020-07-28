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
    API_ERROR: 10000,
    OBJECT_NOT_FOUND: 10001,
    INVALID_CREDENTIALS: 10002,
    VALIDATION_ERROR: 10003,
    ROUTE_NOT_FOUND: 10004,
    CREATE_USER: 10005,
    UPDATE_USER: 10006,
    GET_USER: 10007,
    NOT_ALLOWED: 10008,
    REFRESH_TOKEN: 10009,
    RESEND_VERIFICATION_EMAIL: 10010,
    FORGOT_PASSWORD: 10011,
    LOGIN_ERROR: 10012,
    CREATE_EXPERIMENT: 10013,
    UPDATE_EXPERIMENT: 10014,
    GET_EXPERIMENT: 10015,
    GET_EXPERIMENTS: 10016,
    DELETE_EXPERIMENT: 10017,
    UPLOAD_FILE: 10018,
    GET_SEARCH: 10019,
    SEARCH_METADATA_VALUES: 10019,
    SAVE_SEARCH_RESULTS: 10020,
    UPLOAD_EXPERIMENT: 10021,
    UPDATE_EXPERIMENT_RESULTS: 10022,
    REINDEX_EXPERIMENTS: 10023,
    CREATE_ORGANISATION: 10024,
    UPDATE_ORGANISATION: 10025,
    GET_ORGANISATION: 10026,
    GET_ORGANISATIONS: 10027,
    DELETE_ORGANISATIONS: 10028,
    JOIN_ORGANISATION: 10029,
    APPROVE_MEMBER: 10030,
    REJECT_MEMBER: 10031,
    REMOVE_MEMBER: 10032,
    PROMOTE_MEMBER: 10033,
    DEMOTE_MEMBER: 10034,
    UPLOAD_FILE: 10035
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
  },

  ORGANISATION_WHITELIST_FIELDS: ["name"]
};
