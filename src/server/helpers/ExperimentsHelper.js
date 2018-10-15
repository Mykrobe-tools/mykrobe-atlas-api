import fs from "fs";
import util from "util";
import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch/";
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
    const samples = await readFileAsync(path, "UTF-8");
    const json = JSON.parse(samples);
    let transformedSample;
    if (json && Array.isArray(json)) {
      json.forEach(sample => {
        // mapping here
      });
      const sampleJson = Object.assign({}, json[1]);
      transformedSample = mapper.transform(sampleJson);
    }
    try {
      const savedSample = await this.saveSample(transformedSample, owner);
      return savedSample;
    } catch (e) {
      return e;
    }
  }

  static async saveSample(sample, owner) {
    const existing = await Experiment.findByIsolateId(
      sample.metadata.isolateId
    );
    const isOwner = existing && existing.owner.id === owner.id;
    if (existing && isOwner) {
      Object.keys(sample).forEach(key => {
        existing.set(key, sample[key]);
      });
      const savedExperiment = await existing.save();
      await ElasticsearchHelper.updateDocument(
        config,
        savedExperiment,
        "experiment"
      );
      return savedExperiment;
    } else if (!existing) {
      const experiment = new Experiment(sample);
      experiment.owner = owner;
      const savedExperiment = await experiment.save();
      await ElasticsearchHelper.indexDocument(
        config,
        savedExperiment,
        "experiment"
      );
      return savedExperiment;
    }
  }
}

export default ExperimentsHelper;
