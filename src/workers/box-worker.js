import winston from 'winston';
import BoxSDK from 'box-node-sdk';
import fs from 'fs';
import config from '../config/env';
import Experiment from '../server/models/experiment.model';

const client = config.monqClient;
const worker = client.worker(['box']);

const sdk = new BoxSDK({
  clientID: config.boxClientId,
  clientSecret: config.boxClientSecret
});

// Create a basic API client
worker.register({ download: (data, next) => {
  const boxClient = sdk.getBasicClient(data.accessToken);
  boxClient.files.getReadStream(data.fileId, null, (err, stream) => {
    if (err) {
      next(err);
    }
    else {
      const output = fs.createWriteStream(`${config.uploadDir}/experiments/${data.id}/file/${data.fileId}`);
      stream.pipe(output);
      Experiment.get(data.id)
        .then((experiment) => {
          experiment.file = data.fileId; // eslint-disable-line no-param-reassign
          experiment.save()
            .then(() => {
              winston.info('Download completed and experiment saved');
              next();
            });
        })
        .catch((error) => {
          winston.info(`Error:${error}`);
          next(error);
        });
    }
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
