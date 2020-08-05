import querystring from "querystring";

import CLIEventJSONTransformer from "./CLIEventJSONTransformer";
import SearchJSONTransformer from "../SearchJSONTransformer";

/**
 * A class to transform a sequence started payload
 */
class SearchEventJSONTransformer extends CLIEventJSONTransformer {
  /**
   * Transform the object
   * @param {object} o the object to transform
   * @param {object} options to control the transformation
   *
   * @return {object} the transformed object
   */
  transform(o, options) {
    const res = super.transform(o, options);

    const search = o.search;
    if (search) {
      res.search = new SearchJSONTransformer().transform(search, {});
      res.id = search.id;

      if (res.search && res.search.query) {
        // bigsi query will have been reset into query
        const qs = querystring.stringify(res.search.query);

        if (qs) {
          res.searchURL = `/experiments/search?${qs}`;
        }
      }
    }

    return res;
  }
}

export default SearchEventJSONTransformer;
