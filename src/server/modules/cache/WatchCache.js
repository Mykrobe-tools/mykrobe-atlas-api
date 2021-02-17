import Constants from "../../Constants";
import logger from "../logging/logger";
import Cache from "./Cache";

const PREFIX = "watch";

class WatchCache {
  getKey(experimentId) {
    return `${PREFIX}-${experimentId}`;
  }

  async setUser(experimentId, user, expiry = Constants.WATCH_IN_SECONDS) {
    logger.debug(`WatchCache#setUser: enter`);
    logger.debug(`WatchCache#setUser: user: ${JSON.stringify(user, null, 2)}`);
    if (!user) {
      return;
    }
    const users = await this.getUsers(experimentId);
    const updatedUsers = users ? users : [];
    logger.debug(`WatchCache#setUser: Current users: ${JSON.stringify(updatedUsers, null, 2)}`);
    updatedUsers.push(user);

    const key = this.getKey(experimentId);
    logger.debug(`WatchCache#setUser: Store in ${key}: ${JSON.stringify(updatedUsers, null, 2)}`);
    Cache.setJson(key, updatedUsers, expiry);
  }

  async getUsers(experimentId) {
    logger.debug(`WatchCache#getUsers: enter`);
    const key = this.getKey(experimentId);
    logger.debug(`WatchCache#getUsers: key: ${key}`);
    return await Cache.getJson(key);
  }

  async delete(experimentId) {
    logger.debug(`WatchCache#delete: enter`);
    const key = this.getKey(experimentId);
    logger.debug(`WatchCache#delete: key: ${key}`);
    return await Cache.delete(key);
  }
}

const cache = new WatchCache();
export default cache;
