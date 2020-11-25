export default {
  index: process.env.ES_INDEX_NAME || "atlas",
  settings: {
    "index.max_result_window": 100000
  },
  log: process.env.ELASTICSEARCH_LOG_LEVEL || "info"
};
