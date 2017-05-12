import path from 'path';
import monq from 'monq';

const env = process.env.NODE_ENV || 'development';
const config = require(`./${env}`); // eslint-disable-line import/no-dynamic-require

const defaults = {
  root: path.join(__dirname, '/..'),
  monqClient: monq(config.db, { safe: true }),
  adminRole: 'Admin',
  notification: 'email',
  username: 'email',
  esCluster: process.env.ES_CLUSTER_URL,
  esIndexName: 'atlas',
  resultsPerPage: 50,
  ses: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
  }
};

const functions = {
  usePassword: () => defaults.username === 'email'
};

export default Object.assign(defaults, functions, config);
