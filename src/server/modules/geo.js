import nodeGeocoder from "node-geocoder";

import config from "../../config/env";

const getOptions = () => {
  const geo = config.services.geo;
  if (geo) {
    if (geo.google) {
      const options = {
        provider: "google",
        apiKey: geo.google.apiKey,
        formatter: null
      };
      return options;
    }
  }

  return null;
};

const getGeocoder = () => {
  const options = getOptions();
  if (options) {
    return nodeGeocoder(options);
  }

  return null;
};

const geocode = async address => {
  const geocoder = getGeocoder();

  if (geocoder) {
    if (Array.isArray(address)) {
      const location = await geocoder.batchGeocode(address);
      return location;
    } else {
      const location = await geocoder.geocode(address);
      return location;
    }
  }
};

const geo = Object.freeze({
  geocode
});

export default geo;
