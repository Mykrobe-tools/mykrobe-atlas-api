import Constants from "../../Constants";
import logger from "../logging/logger";
import Cache from "./Cache";

const PREFIX = "response";

class ResponseCache {
  getKey(key) {
    return `${PREFIX}-${key}`;
  }

  setResponse(responseKey, response, expiry = Constants.RESPONSE_CACHE_IN_SECONDS) {
    const key = this.getKey(responseKey);
    Cache.setJson(key, response, expiry);
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
    logger.debug(`ResponseCache#setQueryResponse: enter`);
    const key = this.getKey(`${methodKey}-${queryKey}`);
    logger.debug(`ResponseCache#setQueryResponse: key: ${key}`);
    await Cache.setJson(key, response, expiry);
  }

  async getQueryResponse(methodKey, queryKey) {
    logger.debug(`ResponseCache#getQueryResponse: enter`);
    const key = this.getKey(`${methodKey}-${queryKey}`);
    logger.debug(`ResponseCache#getQueryResponse: key: ${key}`);
    const value = await Cache.getJson(key);
    return value;
  }

  async deleteQueryResponse(methodKey, queryKey) {
    logger.debug(`ResponseCache#deleteQueryResponse: enter`);
    const key = this.getKey(`${methodKey}-${queryKey}`);
    logger.debug(`ResponseCache#deleteQueryResponse: key: ${key}`);
    return await Cache.delete(key);
  }
}

const cache = new ResponseCache();
export default cache;
