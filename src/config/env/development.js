import nodemailer from 'nodemailer-mock';

export default {
  env: 'development',
  MONGOOSE_DEBUG: true,
  jwtSecret: 'Wai6nZh6Mi3U08r7WPki6B2IPP2RgC25',
  db: 'mongodb://localhost/atlas-dev',
  nodemailer,
  port: 3000
};
