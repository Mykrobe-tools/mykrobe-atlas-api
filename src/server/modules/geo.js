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
    if (geo.google && geo.google.apiKey) {
      const options = {
        provider: "google",
        apiKey: geo.google.apiKey,
        formatter: null
      };
      return options;
    } else if (geo.locationIq && geo.locationIq.apiKey) {
      const options = {
        provider: "locationiq",
        apiKey: geo.locationIq.apiKey,
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

const getCacheKey = address => {
  if (typeof address === "object") {
    return JSON.stringify(address);
  } else if (typeof address === "string") {
    return address;
  }
  return null;
};

const geocode = async address => {
  const cacheKey = getCacheKey(address);
  const cachedLocation = cache.get(cacheKey);
  if (typeof cachedLocation !== "undefined" && cachedLocation) {
    return cachedLocation;
  }

  const geocoder = getGeocoder();
  if (geocoder) {
    if (Array.isArray(address)) {
      const location = await geocoder.batchGeocode(address);
      return location;
    } else if (typeof address === "object" && address.country) {
      const location = await geocoder.geocode(address);
      cache.set(cacheKey, location);
      return location;
    } else if (typeof address === "string") {
      const location = await geocoder.geocode(address);
      cache.set(cacheKey, location);
      return location;
    }
  }
};

const geo = Object.freeze({
  geocode
});

export default geo;
