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
    await service.search(group.search);
  }

  static async enrichGroupWithExperiments(group, search) {
    const type = search.type;

    const result = search.get("result");
    const results = result.results;
    const filteredResults = BigsiSearchHelper.filter(type, results);
    const isolateIds = filteredResults.map(result => result["metadata.sample.isolateId"]);
    const experiments = await Experiment.findByIsolateIds(isolateIds);

    group.set("experiments", experiments);
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
}

export default GroupHelper;
