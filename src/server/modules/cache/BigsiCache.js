import Constants from "../../Constants";
import Cache from "./Cache";
import config from "../../../config/env";

const PREFIX = "bigsi";

class BigsiCache {
  getKey(hash) {
    return `${PREFIX}-${hash}`;
  }

  setResult(hash, result, expiry = config.services.bigsiResultsTTL * 3600) {
    const key = this.getKey(hash);
    Cache.setJson(key, result, expiry);
  }

  async getResult(hash) {
    const key = this.getKey(hash);
    return await Cache.getJson(key);
  }

  async deleteResult(hash) {
    const key = this.getKey(hash);
    return await Cache.delete(key);
  }
}

const cache = new BigsiCache();
export default cache;
