import winston from 'winston';
import oneDriveAPI from 'onedrive-api';
import fs from 'fs';
import Experiment from '../server/models/experiment.model';
import config from '../config/env';

const client = config.monqClient;
const worker = client.worker(['oneDrive']);

worker.register({ download: (data, next) => {
  const accessToken = data.accessToken;
  const output = fs.createWriteStream(`${config.uploadDir}/experiments/${data.id}/file/${data.fileId}`);
  oneDriveAPI.items.download({ accessToken, itemId: data.fileId })
    .then((stream) => {
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
        .catch((err) => {
          winston.info(`Error:${data}`);
          next(err);
        });
    })
    .catch((error) => {
      winston.info(`onedrive-api error ${error}`);
      next(error);
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
