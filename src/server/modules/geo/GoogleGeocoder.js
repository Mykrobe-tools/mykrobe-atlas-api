import logger from "../logger";

import Geocoder from "./Geocoder";

class GoogleGeocoder extends Geocoder {
  async search(address) {
    if (this.isValidAddress(address) && this.impl) {
      const query =
        typeof address === "object"
          ? [address.city, address.country || address.countryCode].filter(Boolean).join(", ")
          : address;
      const matches = await this.impl.geocode(query);
      logger.debug(`Matches: ${JSON.stringify(matches)}`);
      return matches;
    }

    return null;
  }
}

export default GoogleGeocoder;
