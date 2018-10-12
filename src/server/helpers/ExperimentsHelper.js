import fs from "fs";
import util from "util";
import mapper from "../modules/mapper";

const readFileAsync = util.promisify(fs.readFile);

/**
 * A helper class for experiments
 */
class ExperimentsHelper {
  /**
   * Return an array of allowed filters.  Null allows all
   * e.g. metadata.genotyping.wgsPlatform
   *
   * @return {array} allowed filters
   */
  static getFiltersWhitelist() {
    // allow everything
    return null;
  }

  /**
   * Bulk load of experiments from a json file
   * @param {*} path
   * @param {*} encoding
   */
  static async load(path, encoding) {
    const samples = await readFileAsync(path, "UTF-8");
    const json = JSON.parse(samples);
    let data;
    if (json && Array.isArray(json)) {
      json.forEach(sample => {
        // mapping here
      });
      const a = Object.assign({}, json[1]);
      data = mapper.transform(a);
    }
    return data;
  }
}

export default ExperimentsHelper;
