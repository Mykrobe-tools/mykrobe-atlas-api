import winston from 'winston';
import BoxSDK from 'box-node-sdk';
import config from '../config/env';

const client = config.monqClient;
const worker = client.worker(['box']);

const sdk = new BoxSDK({
  clientID: 'st6bwkk028q2qm57mytcf1uldgm5jh58',
  clientSecret: 'WT51KL9KPlBGgkvZs0tKqyCJEWJ7SKPb'
});

// Create a basic API client
const boxClient = sdk.getBasicClient('TIMfFVeMOs9civbyodRFluRw5K7NM3R2');

worker.register({ download: (data, next) => {
  winston.info('start download');
  boxClient.folders.getItems('0', { fields: 'name,shared_link,permissions,collections,sync_state' }, (err, res) => {
    res.entries.forEach((entry) => {
      winston.info(`file:${entry.name} id:${entry.id}`);
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
