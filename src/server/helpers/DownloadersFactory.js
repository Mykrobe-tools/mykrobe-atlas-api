import DropboxDownloader from './DropboxDownloader';
import BoxDownloader from './BoxDownloader';
import OnedriveDownloader from './OnedriveDownloader';
import GoogledriveDownloader from './GoogledriveDownloader';

/**
 * A factory class class to create downloaders
 */
class DownloadersFactory {
  static create(destination, options) {
    if (options.provider === 'dropbox') {
      return new DropboxDownloader(destination, options);
    }
    else if (options.provider === 'box') {
      return new BoxDownloader(destination, options);
    }
    else if (options.provider === 'oneDrive') {
      return new OnedriveDownloader(destination, options);
    }
    else if (options.provider === 'googleDrive') {
      return new GoogledriveDownloader(destination, options);
    }
    return null;
  }
}

export default DownloadersFactory;
