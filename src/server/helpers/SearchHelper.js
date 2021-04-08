import stableStringify from "json-stable-stringify";
import crypto from "crypto";

import config from "../../config/env";
class SearchHelper {
  static generateHash(data) {
    const stable = stableStringify(data);
    const hash = crypto
      .createHash("md5")
      .update(stable)
      .digest("hex");
    return hash;
  }

  static getSearchSettings(type) {
    return {
      type,
      ...config.elasticsearch
    };
  }
}

export default SearchHelper;
