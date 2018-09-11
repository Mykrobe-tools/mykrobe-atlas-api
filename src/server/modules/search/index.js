import { isBigsiQuery, extractBigsiQuery, callBigsiApi } from "./bigsi";
import { parseQuery } from "./query-parser";

const search = Object.freeze({
  isBigsiQuery,
  extractBigsiQuery,
  callBigsiApi,
  parseQuery
});

export default search;
