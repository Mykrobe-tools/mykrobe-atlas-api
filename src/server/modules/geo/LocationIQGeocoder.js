import Geocoder from "./Geocoder";

class LocationIQGeocoder extends Geocoder {
  async search(address) {
    if (this.isValidAddress(address) && this.impl) {
      const query = {};
      if (address.countryCode) {
        query.country = address.countryCode;
      }
      if (address.city) {
        query.city = address.city;
      }
      const matches = await this.impl.geocode(query);
      return matches;
    }

    return null;
  }
}

export default LocationIQGeocoder;
