import https from 'https';
import fs from 'fs';
import winston from 'winston';

/**
 * A class to download large files from a url
 * @property response : the response Object from mongoose
 */
class Downloader {
  constructor(destination, options) {
    this.destination = destination;
    this.options = options;
  }

  download() {
    const file = fs.createWriteStream(this.destination);
    https.get(this.options).on('response', (res) => {
      let downloaded = 0;
      res.on('data', (chunk) => {
        file.write(chunk);
        downloaded += chunk.length;
      }).on('end', () => {
        file.end();
        winston.info(`${downloaded} bytes successfully downloaded`);
      }).on('error', (err) => {
        winston.info(err.message);
      });
    });
  }
}

export default Downloader;
