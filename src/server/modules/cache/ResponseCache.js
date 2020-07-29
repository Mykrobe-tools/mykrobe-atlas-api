import Cache from "./Cache";

const PREFIX = "response";

class ResponseCache extends Cache {
  getKey(key) {
    return `${PREFIX}-${key}`;
  }

  setResponse(responseKey, response) {
    const key = this.getKey(responseKey);
    Cache.setJson(key, response);
  }

  async getResponse(responseKey) {
    const key = this.getKey(responseKey);
    return await Cache.getJson(key);
  }

  async setQueryResponse(
    methodKey,
    queryKey,
    response,
    expiry = Constants.RESPONSE_CACHE_IN_SECONDS
  ) {
    const key = this.getKey(`${methodKey}-${queryKey}`);
    await Cache.setJson(key, response, expiry);
  }

  async getQueryResponse(methodKey, queryKey) {
    const key = this.getKey(`${methodKey}-${queryKey}`);
    return await Cache.getJson(key);
  }
}

const cache = new ResponseCache();
export default cache;
