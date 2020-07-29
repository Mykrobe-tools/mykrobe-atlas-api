import stableStringify from "json-stable-stringify";
import hash from "object-hash";

class CacheHelper {
  getObjectHash(o) {
    if (o) {
      const stable = JSON.parse(stableStringify(o));
      const h = hash(stable);

      return h;
    }
    return null;
  }
}

const helper = new CacheHelper();
export default helper;
