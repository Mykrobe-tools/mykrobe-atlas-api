import winston from 'winston';
import fs from 'fs';
import googleDrive from 'google-drive';
import config from '../config/env';
import Experiment from '../server/models/experiment.model';

const client = config.monqClient;
const worker = client.worker(['googleDrive']);

worker.register({ download: (data, next) => {
  const token = data.accessToken;
  const output = fs.createWriteStream(`${config.uploadDir}/experiments/${data.id}/file/${data.fileId}`);
  googleDrive(token).files(data.fileId).get((err) => {
    if (err) {
      next(err);
    }
    else {
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
  })
  .pipe(output);
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
