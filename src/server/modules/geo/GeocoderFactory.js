import GoogleGeocoder from "./GoogleGeocoder";
import LocationIQGeocoder from "./LocationIQGeocoder";

class GeocoderFactory {
  /**
   * Get node-geocoder options based on a config
   *
   * @param {*} config
   */
  static getOptions(config) {
    if (config) {
      if (config.google && config.google.apiKey) {
        const options = {
          provider: "google",
          apiKey: config.google.apiKey,
          formatter: null
        };
        return options;
      } else if (config.locationIq && config.locationIq.apiKey) {
        const options = {
          provider: "locationiq",
          apiKey: config.locationIq.apiKey,
          formatter: null
        };
        return options;
      }
    }

    return null;
  }

  /**
   * Get a geocoder based on a config
   *
   * @param {*} config
   */
  static getGeocoder(config) {
    const options = this.getOptions(config);
    if (options && options.provider) {
      switch (options.provider) {
        case "google": {
          return new GoogleGeocoder(options);
        }
        case "locationiq": {
          return new LocationIQGeocoder(options);
        }
      }
    }

    return null;
  }
}

export default GeocoderFactory;
