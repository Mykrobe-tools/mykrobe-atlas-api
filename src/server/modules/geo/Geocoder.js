import nodeGeocoder from "node-geocoder";

import GeoCache from "../cache/GeoCache";

class Geocoder {
  constructor(options) {
    this.options = options;
    if (options) {
      this.impl = nodeGeocoder(this.options);
    }
  }

  async geocode(address) {
    const coordinates = await GeoCache.getLocation(address);

    if (coordinates) {
      return coordinates;
    } else {
      const matches = await this.search(address);
      const coordinates = this.getCoordinates(address, matches);
      if (coordinates && Object.keys(coordinates).length) {
        GeoCache.setLocation(address, coordinates);
        return coordinates;
      }
    }

    return null;
  }

  isValidAddress(address) {
    if (typeof address === "object") {
      return Object.keys(address).length;
    } else if (typeof address === "string") {
      return address !== "" && address !== null;
    }
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
