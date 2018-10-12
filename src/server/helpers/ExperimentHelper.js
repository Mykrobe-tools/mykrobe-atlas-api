import fs from "fs";
import util from "util";

const readFileAsync = util.promisify(fs.readFile);

/**
 * A helper class for experiments
 */
class ExperimentHelper {
  static async load(path, encoding) {
    const data = await readFileAsync(path, "UTF-8");
    return data;
  }
}

export default ExperimentHelper;
