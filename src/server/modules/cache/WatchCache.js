import Constants from "../../Constants";
import Cache from "./Cache";

const PREFIX = "watch";

class WatchCache {
  getKey(experimentId) {
    return `${PREFIX}-${experimentId}`;
  }

  async setUser(experimentId, user, expiry = Constants.WATCH_IN_SECONDS) {
    if (!user) {
      return;
    }
    const users = await this.getUsers(experimentId);
    const updatedUsers = users ? users : [];
    updatedUsers.push(user);

    const key = this.getKey(experimentId);
    Cache.setJson(key, updatedUsers, expiry);
  }

  async getUsers(experimentId) {
    const key = this.getKey(experimentId);
    return await Cache.getJson(key);
  }

  async delete(experimentId) {
    const key = this.getKey(experimentId);
    return await Cache.delete(key);
  }
}

const cache = new WatchCache();
export default cache;
