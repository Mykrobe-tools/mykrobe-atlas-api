import nodeGeocoder from "node-geocoder";

import logger from "../logger";
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
    const coordinates = await GeoCache.getLocation(address);

    if (coordinates) {
      logger.debug(`Geocoder#geocode: Using cached coordinates: ${JSON.stringify(coordinates)}`);
      return coordinates;
    } else {
      logger.debug(`Geocoder#geocode: No cached coordinates`);
      const matches = await this.search(address);
      const coordinates = this.getCoordinates(address, matches);
      if (coordinates && Object.keys(coordinates).length) {
        GeoCache.setLocation(address, coordinates);
        logger.debug(
          `Geocoder#geocode: Coordinates found and added to cache: ${JSON.stringify(coordinates)}`
        );
        return coordinates;
      }
    }

    return null;
  }

  isValidAddress(address) {
    if (typeof address === "object") {
      const keys = Object.keys(address || {});
      const numKeys = keys.length;
      if (numKeys) {
        if (address.city || address.countryCode || address.country) {
          return true;
        }
      }
    } else if (typeof address === "string") {
      return address !== "" && address !== null;
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
