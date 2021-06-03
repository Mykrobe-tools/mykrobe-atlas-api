import Constants from "../../Constants";
import Cache from "./Cache";

const PREFIX = "cluster";

class ClusterCache {
  getKey(sampleId) {
    return `${PREFIX}-${sampleId}`;
  }

  setResult(sampleId, result, expiry = Constants.CLUSTER_RESULT_IN_SECONDS) {
    const key = this.getKey(sampleId);
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

const cache = new ClusterCache();
export default cache;
