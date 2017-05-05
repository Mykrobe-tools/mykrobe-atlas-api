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
  ses: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
  },
  boxClientId: process.env.BOX_CLIENT_ID,
  boxClientSecret: process.env.BOX_CLIENT_SECRET
};

const functions = {
  usePassword: () => defaults.username === 'email'
};

export default Object.assign(defaults, functions, config);
