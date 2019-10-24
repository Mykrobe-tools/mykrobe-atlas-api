import URL from "url";
import {
  SearchQuery,
  AggregationSearchQuery
} from "makeandship-api-common/lib/modules/elasticsearch/";
import { experimentSearch as experimentSearchSchema } from "mykrobe-atlas-jsonschema";
import Constants from "../../constants";

/**
 * Parse the incoming query
 */
class RequestSearchQueryParser {
  constructor(url) {
    this.url = url;
    this.pathname = this.getPathname(this.url);
  }

  /**
   * Parse the incoming query and return a SearchQuery or AggregationSearchQuery
   * @param {*} query
   */
  parse(filters) {
    if (this.pathname.endsWith(Constants.CHOICES_URL_SUFFIX)) {
      return new AggregationSearchQuery(filters, experimentSearchSchema, Constants.INDEX_TYPE);
    } else if (
      this.pathname.endsWith(Constants.SEARCH_URL_SUFFIX) ||
      this.pathname.endsWith(Constants.EXPERIMENTS_URL_SUFFIX)
    ) {
      return new SearchQuery(filters, experimentSearchSchema, Constants.INDEX_TYPE);
    }
    return null;
  }

  /**
   * Get the url pathname
   * @param {*} url
   */
  getPathname(url) {
    if (url) {
      const parsed = URL.parse(url);
      if (parsed) {
        return parsed.pathname;
      }
    }

    return null;
  }
}

export default RequestSearchQueryParser;
