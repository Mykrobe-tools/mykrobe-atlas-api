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
  }
};
