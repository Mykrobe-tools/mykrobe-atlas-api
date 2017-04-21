import nodemailer from 'nodemailer';

export default {
  env: 'production',
  jwtSecret: 'ke2S95i75uPR99na4sTHE7PlmsrYE61P',
  db: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.DB_PORT_27017_TCP_ADDR}/atlas`,
  nodemailer,
  uploadDir: '/app/uploads',
  port: 3000
};
