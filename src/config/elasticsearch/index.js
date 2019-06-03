export default {
  index: process.env.ES_INDEX_NAME || "atlas",
  settings: {
    "index.max_result_window": 100000
  }
};
