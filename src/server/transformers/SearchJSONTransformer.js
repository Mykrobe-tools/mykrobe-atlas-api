import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";
import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";
import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";
import SearchExperimentJSONTransformer from "./SearchExperimentJSONTransformer";
import UserJSONTransformer from "./UserJSONTransformer";
import SearchHelper from "../helpers/SearchHelper";

import Constants from "../Constants";

const BLACKLIST = ["__v"];

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class SearchJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options = {}) {
    let res = super.transform(o, options);
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });

    if (res.user && options.includeUser) {
      res.user = new UserJSONTransformer().transform(res.user, options);
    }

    if (res.bigsi && res.bigsi.query) {
      this.enrichSearchQuery(res);
    }

    const status = res.status;
    switch (status) {
      case Constants.SEARCH_COMPLETE:
        this.transformComplete(res);
        break;
      case Constants.SEARCH_PENDING:
        this.transformPending(res);
        break;
    }

    return res;
  }

  transformComplete(res) {
    if (res.result) {
      // hits
      const results = res.result.results;

      if (results) {
        const transformer = new ArrayJSONTransformer();
        const experiments = transformer.transform(results, {
          transformer: SearchExperimentJSONTransformer
        });
        res.results = experiments;
        // pagination
        res.pagination = {
          next: 1,
          page: 1,
          pages: 1,
          per: results.length > 10 ? results.length : 10,
          previous: 1
        };

        // total
        res.total = results.length;
      } else {
        res.results = [];
        res.pagination = {};
        res.total = 0;
      }

      delete res.result;
    }
  }

  transformPending(res) {}

  enrichSearchQuery(res) {
    const { ref, pos, alt, gene } = res.bigsi.query;
    const queryString = SearchHelper.getQueryString(ref, pos, alt, gene);

    res.query = { q: queryString };
  }
}

export default SearchJSONTransformer;
