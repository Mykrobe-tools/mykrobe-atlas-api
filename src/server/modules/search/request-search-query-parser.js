import URL from "url";
import {
  SearchQuery,
  AggregationSearchQuery
} from "makeandship-api-common/lib/modules/elasticsearch/";
import { experimentSearch as experimentSearchSchema } from "mykrobe-atlas-jsonschema";
import SchemaExplorer from "makeandship-api-common/lib/modules/jsonschema/schema-explorer";
import Constants from "../../Constants";

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
    const ehancedFilters = this.enhanceFilters(filters);
    if (this.pathname.endsWith(Constants.CHOICES_URL_SUFFIX)) {
      return new AggregationSearchQuery(
        ehancedFilters,
        experimentSearchSchema,
        Constants.INDEX_TYPE
      );
    } else if (
      this.pathname.endsWith(Constants.SEARCH_URL_SUFFIX) ||
      this.pathname.endsWith(Constants.EXPERIMENTS_URL_SUFFIX) ||
      this.pathname.endsWith(Constants.SUMMARY_URL_SUFFIX)
    ) {
      return new SearchQuery(ehancedFilters, experimentSearchSchema, Constants.INDEX_TYPE);
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

  /**
   * Enhance the filters with synonyms
   * @param {*} filters
   * @returns
   */
  enhanceFilters(filters) {
    if (filters.q) {
      const keyword = filters.q;
      const explorer = new SchemaExplorer(experimentSearchSchema);
      const attributes = explorer.getAttributes();

      attributes.forEach(path => {
        const object = explorer.getSchema(path);
        if (object.synonyms && object.synonyms.length) {
          object.synonyms.forEach(synonym => {
            if (synonym.indexOf("=>") > -1) {
              const synonymKey = synonym.split("=>")[0];
              const synonymValue = synonym.split("=>")[1];
              const fiedlPath =
                synonymKey.indexOf("/") > -1
                  ? `${path}.${synonymKey.split("/")[0].toLowerCase()}`
                  : path;
              const keywords = synonymValue.split(",").map(item => item.trim());
              if (keywords.indexOf(keyword) > -1) {
                delete filters.q;
                filters[`${fiedlPath}.raw`] = keyword;
              }
            }
          });
        }

        if (object.useSynonyms && object.enum && object.enumNames) {
          if (object.enumNames.indexOf(keyword) > -1) {
            delete filters.q;
            filters[`${path}.raw`] = keyword;
          }
        }
      });
    }

    return filters;
  }
}

export default RequestSearchQueryParser;
