import nodemailer from 'nodemailer-mock';

export default {
  env: 'test',
  jwtSecret: 'P4yzg1Z18Xo8Hhk8mfFtW978G56e6C20',
  db: 'mongodb://localhost/atlas-test',
  nodemailer,
  port: 3000
};
