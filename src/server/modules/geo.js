import nodeGeocoder from "node-geocoder";
import Cache from "node-cache";

import config from "../../config/env";

// local cache
const options = {
  stdTTL: 1000 * 60 * 60,
  checkperiod: 600
};
const cache = new Cache(options);

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
  const cachedLocation = cache.get(address);
  if (typeof cachedLocation !== "undefined" && cachedLocation) {
    return cachedLocation;
  }

  const geocoder = getGeocoder();
  if (geocoder) {
    if (Array.isArray(address)) {
      const location = await geocoder.batchGeocode(address);
      cache.set(address, location);
      return location;
    } else {
      const location = await geocoder.geocode(address);
      cache.set(address, location);
      return location;
    }
  }
};

const geo = Object.freeze({
  geocode
});

export default geo;
