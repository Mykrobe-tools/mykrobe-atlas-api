import fs from "fs";
import util from "util";
import errors from "errors";
import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch/";
import { util as jsonschemaUtil } from "makeandship-api-common/lib/modules/jsonschema";
import { experiment as experimentJsonSchema } from "mykrobe-atlas-jsonschema";
import Experiment from "../models/experiment.model";
import mapper from "../modules/mapper";
import config from "../../config/env";

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
  static async load(path, encoding, owner) {
    let loaded = 0;
    let failures = 0;
    const samples = await readFileAsync(path, "UTF-8");
    const json = JSON.parse(samples);
    const validSamples = [];
    if (json && Array.isArray(json)) {
      for (let i in json) {
        const sampleJson = Object.assign({}, json[i]);
        const transformedSample = mapper.transform(sampleJson);
        const valid = jsonschemaUtil.isValid(
          transformedSample,
          experimentJsonSchema
        );
        if (valid) {
          transformedSample.owner = owner;
          validSamples.push(transformedSample);
          loaded = loaded + 1;
        } else {
          failures = failures + 1;
        }
      }
    }
    const experiments = await Experiment.insertMany(validSamples);
    await ElasticsearchHelper.indexDocuments(config, experiments, "experiment");
    return { loaded, failures };
  }
}

export default ExperimentsHelper;
