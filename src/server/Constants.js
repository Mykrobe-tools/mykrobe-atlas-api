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
    NOT_ALLOWED: 10007,
    REFRESH_TOKEN: 10008,
    RESEND_VERIFICATION_EMAIL: 10009,
    FORGOT_PASSWORD: 10010,
    LOGIN_ERROR: 10011,
    CREATE_EXPERIMENT: 10012,
    UPDATE_EXPERIMENT: 10013,
    GET_EXPERIMENT: 10014,
    GET_EXPERIMENTS: 10015,
    DELETE_EXPERIMENT: 10016,
    UPLOAD_FILE: 10017,
    SEARCH_METADATA_VALUES: 10018,
    UPLOAD_EXPERIMENT: 10019,
    UPDATE_EXPERIMENT_RESULTS: 10020,
    REINDEX_EXPERIMENTS: 10021,
    CREATE_ORGANISATION: 10022,
    UPDATE_ORGANISATION: 10023,
    GET_ORGANISATION: 10024,
    GET_ORGANISATIONS: 10025,
    DELETE_ORGANISATIONS: 10026,
    JOIN_ORGANISATION: 10027,
    APPROVE_MEMBER: 10028,
    REJECT_MEMBER: 10029,
    REMOVE_MEMBER: 10030,
    PROMOTE_MEMBER: 10031,
    DEMOTE_MEMBER: 10032
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
