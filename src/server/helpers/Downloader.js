import https from "https";
import fs from "fs";
import winston from "winston";
import { experimentEventEmitter } from "../modules/events";
import EventHelper from "../helpers/EventHelper";

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

    winston.info(`Downloading: ${JSON.stringify(that.data, null, 2)}`);
    const experiment = that.data.experiment;
    winston.info(`Experiment: ${JSON.stringify(experiment, null, 2)}`);
    const provider = that.data.provider;
    winston.info(`Provider: ${JSON.stringify(provider, null, 2)}`);
    const path = that.options.path;
    winston.info(`Path: ${JSON.stringify(path, null, 2)}`);

    winston.info(
      `Start downloading ${that.destination} with data ${JSON.stringify(that.data, null, 2)}`
    );
    const file = fs.createWriteStream(that.destination);
    winston.info(`Stream created`);
    https.get(this.options).on("response", res => {
      let downloaded = 0;
      const totalSize = res.headers["content-length"];
      res
        .on("data", async chunk => {
          file.write(chunk);
          winston.info(`Data chunk received and written`);
          downloaded += chunk.length;
          winston.info(`Downloaded: ${downloaded}`);
          const status = {
            provider: provider,
            size: downloaded,
            totalSize,
            fileLocation: path
          };
          winston.info(`Status: ${JSON.stringify(status, null, 2)}`);
          winston.info(`Sending 3rd-party-upload-progress event`);
          //await EventHelper.updateUploadsState(this.data.user.id, experiment.id, status);
          experimentEventEmitter.emit("3rd-party-upload-progress", {
            experiment,
            status
          });

          winston.info(`3rd-party-upload-progress event emitted.`);
        })
        .on("end", async () => {
          winston.info(`Download ended`);
          file.end();
          winston.info(`File closed`);
          if (done) {
            winston.info(`Calling the callback function`);
            done();
          }
          const status = {
            provider: provider,
            size: totalSize,
            totalSize,
            fileLocation: path
          };

          winston.info(`Sending 3rd-party-upload-complete event`);
          //await EventHelper.clearUploadsState(this.data.user.id, experiment.id);
          experimentEventEmitter.emit("3rd-party-upload-complete", {
            experiment,
            status
          });
          winston.info(`3rd-party-upload-complete event emitted.`);
        })
        .on("error", err => {
          winston.info(`Error during the download.`);
          winston.info(err.message);

          done(err.message);
        })
        .on("aborted", err => {
          winston.info(`Aborted during the download.`);
          winston.info(err);

          done(err);
        });
    });
  }
}

export default Downloader;
