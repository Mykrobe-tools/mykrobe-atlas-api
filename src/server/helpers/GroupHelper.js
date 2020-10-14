import axios from "axios";
import Search from "../models/search.model";
import BigsiSearchHelper from "./BigsiSearchHelper";
import config from "../../config/env";

class GroupHelper {
  static async triggerSearch(group) {
    const uri = `${config.services.analysisApiUrl}/search`;
    const search = await Search.findByHash(group.searchHash);

    if (search) {
      const { id: search_id, bigsi } = search;
      await axios.post(uri, { search_id, bigsi });
    } else {
      const { type, bigsi } = group.searchQuery;
      const newSearch = new Search();
      newSearch.type = type;
      newSearch.bigsi = bigsi;
      const savedSearch = await newSearch.save();
      const { id: search_id } = savedSearch;
      await axios.post(uri, { search_id, bigsi });
    }
  }

  static async enrichGroupWithExperiments(group, search) {
    const type = search.type;

    const result = search.get("result");
    const results = result.results;
    const filteredResults = BigsiSearchHelper.filter(type, results);
    const experiments = await BigsiSearchHelper.enhanceBigsiResultsWithExperiments(
      filteredResults,
      {}
    );
    group.set("experiments", experiments);
    await group.save();
  }
}

export default GroupHelper;
