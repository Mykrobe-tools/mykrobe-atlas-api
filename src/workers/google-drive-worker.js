import winston from 'winston';
import googleDrive from 'google-drive';
import config from '../config/env';

const client = config.monqClient;
const worker = client.worker(['googleDrive']);

worker.register({ download: (data, next) => {
  winston.info('start download');
  const token = 'ya29.GlwzBICYfSgZWi28aZq3l2d3ec3P_lFx-ntMU-WPh6mYs-1bhvqXNYd0fpnSmNwbcwWeFsgWLnbLFuLd2eiuflCtIWht6iBGD51uAg_TwMsLhdJtNkQVFLMKfzlt9g';
  googleDrive(token).files().list((err, response, body) => {
    const res = JSON.parse(body);
    res.items.forEach((item) => {
      winston.info(`file:${item.title} id:${item.id}`);
    });
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
