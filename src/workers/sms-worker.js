import winston from 'winston';
import config from '../config/env';

const client = config.monqClient;
const worker = client.worker(['sms']);

worker.register({ forgot: (data, next) => {
  winston.info('process forgot queue');
  next();
}
});

worker.register({ verify: (data, next) => {
  winston.info('process verify queue');
  next();
}
});

worker.register({ welcome: (data, next) => {
  winston.info('process welcome queue');
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
