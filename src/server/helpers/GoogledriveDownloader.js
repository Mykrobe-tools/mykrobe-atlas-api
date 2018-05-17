import url from "url";
import Downloader from "./Downloader";

/**
 * A class to download from Googledrive
 */
class GoogledriveDownloader {
  constructor(destination, data) {
    this.destination = destination;
    this.data = data;
  }

  download() {
    const hostname = url.parse(this.data.path).hostname;
    const path = url.parse(this.data.path).path;
    const options = {
      hostname,
      port: 443,
      path,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.data.accessToken}`
      }
    };
    const downloader = new Downloader(this.destination, options);
    downloader.download();
  }
}

export default GoogledriveDownloader;
