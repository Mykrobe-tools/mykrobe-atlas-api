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

    const experiment = that.data.experiment;
    const provider = that.data.provider;
    const path = that.options.path;
    const user = that.data.user;
    const userId = user ? user.id : null;

    const file = fs.createWriteStream(that.destination);

    https.get(this.options).on("response", res => {
      let downloaded = 0;
      const totalSize = res.headers["content-length"];
      res
        .on("data", async chunk => {
          file.write(chunk);
          downloaded += chunk.length;
          const status = {
            id: experiment.id,
            provider: provider,
            size: downloaded,
            totalSize,
            fileLocation: path
          };
          const diff = EventProgress.diff(experiment.id, status);
          if (diff > 1) {
            EventProgress.update(experiment.id, status);
            try {
              await EventHelper.updateUploadsState(userId, experiment.id, status);
            } catch (e) {
              logger.error(`Error updating uploads state: ${JSON.stringify(e, null, 2)}`);
            }
            experimentEventEmitter.emit("3rd-party-upload-progress", {
              experiment,
              status
            });
          }
        })
        .on("end", async () => {
          file.end();
          if (done) {
            done();
          }
          const status = {
            provider: provider,
            size: totalSize,
            totalSize,
            fileLocation: path
          };

          try {
            await EventHelper.clearUploadsState(this.data.user.id, experiment.id);
          } catch (e) {
            logger.error(`Error clearing uploads state: ${JSON.stringify(e, null, 2)}`);
          }
          experimentEventEmitter.emit("3rd-party-upload-complete", {
            experiment,
            status
          });
        })
        .on("error", err => {
          done(err.message);
        })
        .on("aborted", err => {
          done(err);
        });
    });
  }
}

export default Downloader;
