import url from "url";
import Downloader from "./Downloader";

/**
 * A class to download from box
 */
class BoxDownloader {
  constructor(destination, data) {
    this.destination = destination;
    this.data = data;
  }

  download(done) {
    const hostname = url.parse(this.data.path).hostname;
    const path = url.parse(this.data.path).pathname;
    const options = {
      hostname,
      port: 443,
      path,
      method: "GET"
    };
    const downloader = new Downloader(this.destination, this.data, options);
    downloader.download(done);
  }
}

export default BoxDownloader;
