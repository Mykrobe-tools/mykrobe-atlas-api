import ExperimentsHelper from "../../helpers/ExperimentsHelper";
import { isBigsiQuery, extractBigsiQuery } from "./bigsi";

const parseQuery = body => {
  const query = JSON.parse(JSON.stringify(body)); // fast clone

  const search = {};

  if (isBigsiQuery(query)) {
    search.bigsi = extractBigsiQuery(query);
  }

  // only allow the whitelist of filters if set
  const whitelist = ExperimentsHelper.getFiltersWhitelist();
  if (whitelist) {
    query.whitelist = whitelist;
  }

  search.query = query;

  return search;
};

const queryParser = Object.freeze({
  parseQuery
});

export default queryParser;
