import winston from 'winston';
import Dropbox from 'dropbox';
import fs from 'fs';
import request from 'request';
import config from '../config/env';
import Experiment from '../server/models/experiment.model';

const client = config.monqClient;
const worker = client.worker(['dropbox']);

function download(uri, filename, callback) {
  request.head(uri, (err, res) => {
    winston.info('content-type:', res.headers['content-type']);
    winston.info('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
}

worker.register({ download: (data, next) => {
  const dbx = new Dropbox({ accessToken: config.dropboxAccessToken });
  dbx.filesGetTemporaryLink({ path: data.path })
    .then((response) => {
      download(response.link, `${config.uploadDir}/experiments/${data.id}/file/${response.metadata.name}`, () => {
        Experiment.get(data.id)
          .then((experiment) => {
            experiment.file = response.metadata.name; // eslint-disable-line no-param-reassign
            experiment.save()
              .then(() => winston.info('Download completed and experiment saved'));
          });
      });
    })
    .catch((error) => {
      next(error);
    });
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
