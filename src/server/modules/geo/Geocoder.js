import nodeGeocoder from "node-geocoder";

import GeoCache from "../cache/GeoCache";

class Geocoder {
  constructor(options) {
    this.options = options;
    if (options) {
      this.impl = nodeGeocoder(this.options);
    }
  }

  geocode(address) {
    const coordinates = GeoCache.getLocation(address);

    if (coordinates) {
      return coordinates;
    } else {
      const matches = this.search(address);
      const coordinates = this.getCoordinates(address, matches);
      if (coordinates) {
        GeoCache.setLocation(address, coordinates);
        return coordinates;
      }
    }

    return null;
  }

  search(address) {
    return null;
  }

  getCoordinates(address, matches) {
    return null;
  }
}

export default Geocoder;
