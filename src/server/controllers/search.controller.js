import errors from "errors";

import Search from "../models/search.model";
import Audit from "../models/audit.model";

import SearchJSONTransformer from "../transformers/SearchJSONTransformer";
import AuditJSONTransformer from "../transformers/AuditJSONTransformer";
import UserJSONTransformer from "../transformers/UserJSONTransformer";

import ResultsParserFactory from "../helpers/ResultsParserFactory";

import { userEventEmitter } from "../modules/events";

/**
 * Load organisation and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const search = await Search.get(id);
    req.search = search;
    return next();
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Update existing organisation
 * @returns {Organisation}
 */
const saveResult = async (req, res) => {
  const { body, search } = req;
  try {
    const parser = await ResultsParserFactory.create(body);
    if (!parser) {
      return res.jerror(
        new errors.UpdateExperimentError("Invalid result type.")
      );
    }
    const result = parser.parse();
    const savedSearch = await search.saveResult(result);

    const searchJson = new SearchJSONTransformer().transform(savedSearch);

    if (search && search.type) {
      const audit = await Audit.getBySearchId(searchJson.id);
      const auditJson = new AuditJSONTransformer().transform(audit);

      // notify all users and clear the list
      const event = `${result.type}-search-complete`;
      search.users.forEach(user => {
        const userJson = new UserJSONTransformer().transform(user);
        userEventEmitter.emit(event, {
          user: userJson,
          search: searchJson,
          audit: auditJson
        });
      });
      await savedSearch.clearUsers();
    }

    return res.jsend(savedSearch);
  } catch (e) {
    return res.jerror(e);
  }
};

export default {
  load,
  saveResult
};
