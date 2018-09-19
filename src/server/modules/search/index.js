import { isBigsiQuery, extractBigsiQuery, callBigsiApi } from "./bigsi";
import { callTreeApi } from "./tree";
import { parseQuery } from "./query-parser";

const search = Object.freeze({
  isBigsiQuery,
  extractBigsiQuery,
  callBigsiApi,
  callTreeApi,
  parseQuery
});

export default search;
