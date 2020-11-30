import axios from "axios";
import Search from "../models/search.model";
import Experiment from "../models/experiment.model";
import BigsiSearchHelper from "./BigsiSearchHelper";
import SearchHelper from "./SearchHelper";
import AnalysisService from "../modules/analysis/AnalysisService";
import config from "../../config/env";

class GroupHelper {
  static async triggerSearch(group) {
    const service = new AnalysisService();
    group.searches.forEach(async search => await service.search(search));
  }

  static async enrichGroupWithExperiments(group, search) {
    const type = search.type;
    const existingExperiments = group.get("experiments") || [];

    const result = search.get("result");
    const results = result.results;
    const filteredResults = BigsiSearchHelper.filter(type, results);
    const isolateIds = filteredResults.map(result => result["metadata.sample.isolateId"]);
    const experiments = await Experiment.findByIsolateIds(isolateIds);

    group.set("experiments", this.intersection(experiments, existingExperiments));
    await group.save();
  }

  static async getOrCreateSearch(query) {
    const hash = SearchHelper.generateHash(query);
    const search = await Search.findByHash(hash);

    if (search) {
      return search;
    }

    const { type, bigsi } = query;
    const newSearch = new Search();
    newSearch.type = type;
    newSearch.bigsi = bigsi;
    return await newSearch.save();
  }

  static intersection(experiments, existing) {
    if (existing.length === 0) {
      return experiments;
    }

    return experiments.filter(experiment => {
      const exists = existing.find(item => item.id === experiment.id);
      return !!exists;
    });
  }
}

export default GroupHelper;
