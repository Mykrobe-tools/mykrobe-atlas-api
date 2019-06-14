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

  /**
   * Reconstruct free-text query in bigsi search
   * @param {*} ref
   * @param {*} pos
   * @param {*} alt
   * @param {*} gene
   */
  static getQueryString(ref, pos, alt, gene) {
    if (gene) {
      return `${gene}_${ref}${pos}${alt}`;
    } else {
      return `${ref}${pos}${alt}`;
    }
  }
}

export default SearchHelper;
