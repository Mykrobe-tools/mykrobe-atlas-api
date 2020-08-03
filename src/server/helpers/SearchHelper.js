import stableStringify from "json-stable-stringify";
import crypto from "crypto";

class SearchHelper {
  static generateHash(data) {
    const stable = stableStringify(data);
    const hash = crypto
      .createHash("md5")
      .update(stable)
      .digest("hex");
    return hash;
  }
}

export default SearchHelper;
