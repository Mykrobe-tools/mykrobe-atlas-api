import GoogleGeocoder from "./GoogleGeocoder";

class GeocoderFactory {
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

  static getGeocoder(config) {
    const options = this.getOptions(config);
    if (options && options.provider) {
      switch (provider) {
        case "google": {
          return new GoogleGeocoder(options);
        }
        case "locationiq": {
          return new GoogleGeocoder(options);
        }
      }
    }

    return null;
  }
}

export default GeocoderFactory;
