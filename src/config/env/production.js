import nodemailer from "nodemailer";
import monq from "monq";
import Agenda from "agenda";

const dbUri = `mongodb://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
}@${process.env.DB_PORT_27017_TCP_ADDR}/atlas`;

export default {
  env: "production",
  jwtSecret: "ke2S95i75uPR99na4sTHE7PlmsrYE61P",
  monqClient: monq(dbUri),
  db: dbUri,
  nodemailer,
  uploadDir: "/app/uploads",
  port: 3000,
  agenda: new Agenda({ db: { address: dbUri } })
};
