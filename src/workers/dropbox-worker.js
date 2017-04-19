import winston from 'winston';
import config from '../config/env';

const client = config.monqClient;
const worker = client.worker(['dropbox']);

worker.register({ upload: (data, next) => {
  winston.info('process upload queue');
  next();
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
