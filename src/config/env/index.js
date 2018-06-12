import path from "path";
import monq from "monq";

const env = process.env.NODE_ENV || "development";
const config = require(`./${env}`); // eslint-disable-line import/no-dynamic-require

const defaults = {
  root: path.join(__dirname, "/.."),
  adminRole: "Admin",
  notification: "email",
  username: "email",
  esCluster: process.env.ES_CLUSTER_URL,
  esIndexName: process.env.ES_INDEX_NAME || "atlas",
  resultsPerPage: 50,
  ses: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
  },
  rateLimitReset: 15 * 60 * 1000, // 15 min
  rateLimitMax: 1000,
  analysisApiUrl: "https://cli.mykrobe.com",
  analysisApiMaxRetries: 5,
  analysisApiBackOffPeriod: "in 20 minutes"
};

const functions = {
  usePassword: () => defaults.username === "email"
};

export default Object.assign(defaults, functions, config);
