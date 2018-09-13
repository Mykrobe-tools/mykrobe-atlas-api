import https from "https";
import fs from "fs";
import winston from "winston";
import { experimentEventEmitter } from "../modules/events";

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
    const file = fs.createWriteStream(this.destination);
    https.get(this.options).on("response", res => {
      let downloaded = 0;
      const totalSize = res.headers["content-length"];
      res
        .on("data", chunk => {
          file.write(chunk);
          downloaded += chunk.length;

          const experiment = this.data.experiment;
          const status = {
            provider: this.data.provider,
            size: downloaded,
            totalSize,
            fileLocation: this.options.path
          };

          experimentEventEmitter.emit("3rd-party-upload-progress", {
            experiment,
            status
          });
        })
        .on("end", () => {
          if (done) {
            done();
          }
          file.end();

          const experiment = this.data.experiment;
          const status = {
            provider: this.data.provider,
            size: totalSize,
            totalSize,
            fileLocation: this.options.path
          };

          experimentEventEmitter.emit("3rd-party-upload-complete", {
            experiment,
            status
          });
        })
        .on("error", err => {
          winston.info(err.message);
        });
    });
  }
}

export default Downloader;
