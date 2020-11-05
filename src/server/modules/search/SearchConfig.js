import Constants from "../../Constants";

class SearchConfig {
  constructor(options) {
    this.maxPageSize = Constants.MAX_PAGE_SIZE;
    this.scrollTTL = Constants.DEFAULT_SCROLL_TTL;
    this.summaryFields = Constants.LIGHT_EXPERIMENT_FIELDS;
  }

  getMaxPageSize() {
    console.log(`getMaxPageSize`);
    return this.maxPageSize;
  }

  getScrollTTL() {
    return this.scrollTTL;
  }

  getSummaryFields() {
    return this.summaryFields;
  }
}

const config = new SearchConfig();
export default config;
