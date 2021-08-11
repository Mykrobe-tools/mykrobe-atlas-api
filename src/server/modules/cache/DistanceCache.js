import Constants from "../../Constants";
import Cache from "./Cache";
import logger from "../logging/logger";

const PREFIX = "distance";

class DistanceCache {
  getKey(sampleId) {
    return `${PREFIX}-${sampleId}`;
  }

  setResult(sampleId, result, expiry = Constants.DISTANCE_RESULT_IN_SECONDS) {
    const key = this.getKey(sampleId);
    logger.debug(`DistanceCache#setResult: setting for key: ${key}`);
    logger.debug(
      `DistanceCache#setResult: setting results to the cache: ${JSON.stringify(result)}`
    );
    Cache.setJson(key, result, expiry);
  }

  async getResult(sampleId) {
    const key = this.getKey(sampleId);
    return await Cache.getJson(key);
  }

  async deleteResult(sampleId) {
    const key = this.getKey(sampleId);
    return await Cache.delete(key);
  }

  async deleteResults(result) {
    if (result && result.result) {
      const samples = result.result.samples;
      if (samples && Array.isArray(samples)) {
        for (const sample of samples) {
          return await this.deleteResult(sample.sampleId);
        }
      }
    }
  }
}

const cache = new DistanceCache();
export default cache;
