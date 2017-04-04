import winston from 'winston';
import sesTransport from 'nodemailer-ses-transport';
import config from '../config/env';

const client = config.monqClient;
const nodemailer = config.nodemailer;
const transporter = nodemailer.createTransport(sesTransport(config.ses));
const worker = client.worker(['email']);

worker.register({ forgot: (data, next) => {
  const mailOptions = config.resetPasswordOptions;
  mailOptions.to = data.to;
  mailOptions.html = mailOptions.html.replace('%s', data.token);
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      winston.info(err);
      next(err);
    }
    winston.info('Message %s sent', info.messageId);
    next();
  });
}
});

worker.register({ welcome: (data, next) => {
  const mailOptions = config.verifyAccountOptions;
  mailOptions.to = data.to;
  mailOptions.html = mailOptions.html.replace('%s', data.token);
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      winston.info(err);
      next(err);
    }
    winston.info('Message %s sent', info.messageId);
    next();
  });
}
});

worker.on('dequeued', (data) => {
  winston.info(`Dequeued:${data}`);
});

worker.on('failed', (data) => {
  winston.info(`Failed:${data}`);
});

worker.on('complete', (data) => {
  winston.info(`Complete:${data}`);
});

worker.on('error', () => {
  worker.stop();
});

worker.start();
