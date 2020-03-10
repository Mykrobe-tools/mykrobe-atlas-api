import URL from "url";
import { SearchQuery } from "makeandship-api-common/lib/modules/elasticsearch/";

/**
 * Decorate search queries based on context
 */
class SearchQueryDecorator {
  constructor(url) {
    this.url = url;
    this.pathname = this.getPathname(this.url);
  }

  decorate(query) {
    // Early exit if query is not instance of SearchQuery
    if (!(query instanceof SearchQuery)) {
      return null;
    }

    return query;
  }

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

export default SearchQueryDecorator;
