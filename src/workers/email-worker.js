import winston from "winston";
import sesTransport from "nodemailer-ses-transport";
import config from "../config/env";
import MonqHelper from "../server/helpers/MonqHelper";

const client = MonqHelper.getClient(config);
const nodemailer = config.communications.email.nodemailer;
const transporter = nodemailer.createTransport(
  sesTransport(config.communications.email.ses)
);
const worker = client.worker(["email"]);

worker.register({
  forgot: (data, next) => {
    const mailOptions = {
      from: "no-reply@makeandship.com",
      subject: "Reset password request",
      html: `Please click on the following link to reset your password ${
        process.env.ATLAS_APP
      }/auth/reset/${data.token}`,
      to: data.to
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        winston.info(err);
        next(err);
      }
      winston.info("Message %s sent", info.messageId);
      next();
    });
  }
});

worker.register({
  welcome: (data, next) => {
    const mailOptions = {
      from: "no-reply@makeandship.com",
      subject: "Please verify your account",
      html: `Please click on the following link to verify your account ${
        process.env.ATLAS_APP
      }/auth/verify/${data.token}?email=${data.to}`,
      to: data.to
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        winston.info(err);
        next(err);
      }
      winston.info("Message %s sent", info.messageId);
      next();
    });
  }
});

worker.on("dequeued", data => {
  winston.info(`Dequeued:${data}`);
});

worker.on("failed", data => {
  winston.info(`Failed:${data}`);
});

worker.on("complete", data => {
  winston.info(`Complete:${data}`);
});

worker.on("error", () => {
  worker.stop();
});

worker.start();
