import RedisService from "makeandship-api-common/lib/modules/cache/services/RedisService";

const PREFIX = "atlas";

class Cache {
  getKey(name) {
    if (name) {
      const key = `${PREFIX}-${name}`;
      return key;
    }
    return null;
  }
  async get(name) {
    const key = this.getKey(name);

    if (key) {
      return await RedisService.get(key);
    }

    return null;
  }

  set(name, value) {
    const key = this.getKey(name);

    if (key) {
      return RedisService.set(key, value);
    }

    return null;
  }

  async getJson(name) {
    const key = this.getKey(name);
    if (key) {
      const value = await RedisService.get(key);
      if (value) {
        return JSON.parse(value);
      }
    }
    return null;
  }

  setJson(name, value) {
    const key = this.getKey(name);

    if (key) {
      return RedisService.set(key, JSON.stringify(value));
    }

    return null;
  }

  async keys(pattern) {
    if (pattern) {
      const keys = await RedisService.keys(pattern);
      return keys;
    }
    return null;
  }
}

const cache = new Cache();
export default cache;
