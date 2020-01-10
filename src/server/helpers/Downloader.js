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
    winston.info(`Start downloading ${this.destination} with data ${JSON.stringify(this.data)}`);
    const file = fs.createWriteStream(this.destination);
    winston.info(`Stream created`);
    https.get(this.options).on("response", res => {
      let downloaded = 0;
      const totalSize = res.headers["content-length"];
      res
        .on("data", async chunk => {
          file.write(chunk);
          winston.info(`Data chunk received`);
          downloaded += chunk.length;

          winston.info(`Downloaded: ${downloaded}`);
          const experiment = this.data.experiment;
          const status = {
            provider: this.data.provider,
            size: downloaded,
            totalSize,
            fileLocation: this.options.path
          };

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
          const experiment = this.data.experiment;
          const status = {
            provider: this.data.provider,
            size: totalSize,
            totalSize,
            fileLocation: this.options.path
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
        });
    });
  }
}

export default Downloader;
