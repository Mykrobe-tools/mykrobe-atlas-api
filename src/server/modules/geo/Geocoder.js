import nodeGeocoder from "node-geocoder";

import logger from "../logging/logger";
import GeoCache from "../cache/GeoCache";

class Geocoder {
  constructor(options) {
    this.options = options;
    if (options) {
      this.impl = nodeGeocoder(this.options);
    }
  }

  async geocode(address) {
    logger.debug(`Geocoder#geocode: Address: ${JSON.stringify(address)}`);

    if (!this.isValidAddress(address)) {
      logger.debug(`Geocoder#geocode: Not a valid address return null`);
      return null;
    }

    const coordinates = await GeoCache.getLocation(address);

    if (coordinates) {
      logger.debug(`Geocoder#geocode: Using cached coordinates: ${JSON.stringify(coordinates)}`);
      return coordinates;
    } else {
      logger.debug(`Geocoder#geocode: No cached coordinates`);
      const matches = await this.search(address);
      const coordinates = this.getCoordinates(address, matches);
      if (coordinates && Object.keys(coordinates).length) {
        await GeoCache.setLocation(address, coordinates);
        logger.debug(
          `Geocoder#geocode: Coordinates found and added to cache: ${JSON.stringify(coordinates)}`
        );
        return coordinates;
      }
    }

    return null;
  }

  isValidAddress(address) {
    if (typeof address === "string") {
      return address !== "" && address !== null;
    } else if (typeof address === "object") {
      const match = Object.values(address || {}).some(value => value !== null && value !== "");
      if (match) {
        return true;
      }
    }

    return false;
  }

  async search(address) {
    return null;
  }

  getCoordinates(address, matches) {
    if (matches && Array.isArray(matches) && matches.length) {
      const first = matches[0];
      if (first && first.longitude && first.latitude) {
        return {
          longitude: first.longitude,
          latitude: first.latitude
        };
      }
    }
  }
}

export default Geocoder;
