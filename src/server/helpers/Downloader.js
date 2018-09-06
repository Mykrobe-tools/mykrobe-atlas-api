import https from "https";
import fs from "fs";
import winston from "winston";
import { experimentEvent } from "../modules/events";

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
          experimentEvent.emit(
            "3rd-party-upload-progress",
            this.data.experiment,
            {
              provider: this.data.provider,
              size: downloaded,
              totalSize,
              fileLocation: this.options.path
            }
          );
        })
        .on("end", () => {
          if (done) {
            done();
          }
          file.end();
          experimentEvent.emit(
            "3rd-party-upload-complete",
            this.data.experiment,
            {
              provider: this.data.provider,
              size: totalSize,
              totalSize,
              fileLocation: this.options.path
            }
          );
        })
        .on("error", err => {
          winston.info(err.message);
        });
    });
  }
}

export default Downloader;
