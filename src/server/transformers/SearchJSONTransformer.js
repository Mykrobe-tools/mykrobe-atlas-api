import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";
import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";
import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";

import SearchExperimentJSONTransformer from "./SearchExperimentJSONTransformer";
import UserJSONTransformer from "./UserJSONTransformer";

import { createQuery } from "../modules/search/bigsi";

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

    if (res.bigsi) {
      const query = createQuery(res.bigsi);
      if (query && query.q) {
        const { q } = query;
        if (q) {
          if (res.query) {
            res.query.q = q;
          } else {
            res.query = { q };
          }
        }
      }
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
}

export default SearchJSONTransformer;
