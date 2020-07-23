import Cache from "./Cache";

const PREFIX = "geo";

class GeoCache {
  getKey(location) {
    const key = typeof location === "object" ? JSON.stringify(location) : location;

    return `${PREFIX}-${key}`;
  }

  setLocation(locationKey, location, expiry = Constants.GEO_CACHE_IN_SECONDS) {
    const key = this.getKey(locationKey);
    Cache.setJson(key, location);
  }

  async getLocation(location) {
    const key = this.getKey(location);
    return await Cache.getJson(key);
  }
}

const cache = new GeoCache();
export default cache;
