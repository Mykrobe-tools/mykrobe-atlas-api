import nodemailer from "nodemailer-mock";
import monq from "monq";

const dbUri = "mongodb://localhost/atlas-dev";

export default {
  env: "development",
  MONGOOSE_DEBUG: true,
  monqClient: monq(dbUri),
  jwtSecret: "Wai6nZh6Mi3U08r7WPki6B2IPP2RgC25",
  db: dbUri,
  nodemailer,
  uploadDir: "/tmp/uploads",
  port: 3000,
  apiBaseUrl: "localhost:3000",
  swaggerApis: "./**/*.route.js"
};
