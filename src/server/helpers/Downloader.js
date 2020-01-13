import https from "https";
import fs from "fs";
import logger from "../modules/winston";
import { experimentEventEmitter } from "../modules/events";
import EventHelper from "../helpers/events/EventHelper";
import EventProgress from "../helpers/events/EventProgress";

/**
 * A class to download large files from a url
 * @property response : the response Object from mongoose
 */
class Downloader {
  constructor(destination, data, options) {
    this.destination = destination;
    this.data = data;
    this.options = options;
  }

  download(done) {
    const that = this;

    logger.info(`Downloading: ${JSON.stringify(that.data, null, 2)}`);
    const experiment = that.data.experiment;
    logger.info(`Experiment: ${JSON.stringify(experiment, null, 2)}`);
    const provider = that.data.provider;
    logger.info(`Provider: ${JSON.stringify(provider, null, 2)}`);
    const path = that.options.path;
    logger.info(`Path: ${JSON.stringify(path, null, 2)}`);

    logger.info(
      `Start downloading ${that.destination} with data ${JSON.stringify(that.data, null, 2)}`
    );
    const file = fs.createWriteStream(that.destination);
    logger.info(`Stream created`);
    https.get(this.options).on("response", res => {
      let downloaded = 0;
      const totalSize = res.headers["content-length"];
      res
        .on("data", async chunk => {
          file.write(chunk);
          //logger.info(`Data chunk received and written`);
          downloaded += chunk.length;
          //logger.info(`Downloaded: ${downloaded}`);
          const status = {
            id: experiment.id,
            provider: provider,
            size: downloaded,
            totalSize,
            fileLocation: path
          };
          const diff = EventProgress.diff(experiment.id, status);
          logger.info(`diff in 3rd party download percentage: ${diff}`);
          if (diff > 1) {
            //logger.info(`Status: ${JSON.stringify(status, null, 2)}`);
            //logger.info(`Sending 3rd-party-upload-progress event`);
            try {
              await EventHelper.updateUploadsState(this.data.user.id, experiment.id, status);
            } catch (e) {
              logger.info(`Error updating uploads state: ${JSON.stringify(e, null, 2)}`);
            }
            experimentEventEmitter.emit("3rd-party-upload-progress", {
              experiment,
              status
            });
            EventProgress.update(experiment.id, status);
          }
          //logger.info(`3rd-party-upload-progress event emitted.`);
        })
        .on("end", async () => {
          logger.info(`Download ended`);
          file.end();
          logger.info(`File closed`);
          if (done) {
            logger.info(`Calling the callback function`);
            done();
          }
          const status = {
            provider: provider,
            size: totalSize,
            totalSize,
            fileLocation: path
          };

          logger.info(`Sending 3rd-party-upload-complete event`);
          try {
            await EventHelper.clearUploadsState(this.data.user.id, experiment.id);
          } catch (e) {
            logger.info(`Error clearing uploads state: ${JSON.stringify(e, null, 2)}`);
          }
          experimentEventEmitter.emit("3rd-party-upload-complete", {
            experiment,
            status
          });
          logger.info(`3rd-party-upload-complete event emitted.`);
        })
        .on("error", err => {
          logger.info(`Error during the download.`);
          logger.info(err.message);

          done(err.message);
        })
        .on("aborted", err => {
          logger.info(`Aborted during the download.`);
          logger.info(err);

          done(err);
        });
    });
  }
}

export default Downloader;
