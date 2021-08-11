import Constants from "../../Constants";
import CacheHelper from "./CacheHelper";
import Cache from "./Cache";

const PREFIX = "geo";

class GeoCache {
  getKey(location) {
    const key = typeof location === "object" ? CacheHelper.getObjectHash(location) : location;

    return `${PREFIX}-${key}`;
  }

  async setLocation(locationKey, location, expiry = Constants.GEO_CACHE_IN_SECONDS) {
    const key = this.getKey(locationKey);
    await Cache.setJson(key, location, expiry);
  }

  async getLocation(location) {
    const key = this.getKey(location);
    return await Cache.getJson(key);
  }
}

const cache = new GeoCache();
export default cache;
