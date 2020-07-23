import RedisService from "makeandship-api-common/lib/modules/cache/services/RedisService";

const PREFIX = "mykrobe-atlas";

class Cache {
  getKey(name) {
    const key = `${PREFIX}-${name}`;
    return key;
  }
  async get(name) {
    const key = this.getKey(name);
    return await RedisService.get(key);
  }

  set(name, value) {
    const key = this.getKey(name);
    return RedisService.set(key, value);
  }

  async getJson(name) {
    const key = this.getKey(name);
    const value = await RedisService.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  }

  setJson(name, value) {
    const key = this.getKey(name);
    return RedisService.set(key, JSON.stringify(value));
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
