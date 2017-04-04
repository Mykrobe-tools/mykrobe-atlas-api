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
  verifyAccountOptions: {
    from: 'no-reply@makeandship.com',
    subject: 'Please verify your account',
    html: `Please click on the following link to verify your account ${process.env.ATLAS_APP}/auth/verify/%s`
  },
  resetPasswordOptions: {
    from: 'no-reply@makeandship.com',
    subject: 'Reset password request',
    html: `Please click on the following link to reset your password ${process.env.ATLAS_APP}/auth/reset/%s`
  }
};

const functions = {
  usePassword: () => defaults.username === 'email'
};

export default Object.assign(defaults, functions, config);
