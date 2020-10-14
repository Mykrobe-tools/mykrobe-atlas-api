import { ErrorUtil, APIError } from "makeandship-api-common/lib/modules/error";

import Search from "../models/search.model";
import Audit from "../models/audit.model";

import SearchJSONTransformer from "../transformers/SearchJSONTransformer";
import AuditJSONTransformer from "../transformers/AuditJSONTransformer";
import UserJSONTransformer from "../transformers/UserJSONTransformer";

import ResultsParserFactory from "../helpers/results/ResultsParserFactory";
import EventHelper from "../helpers/events/EventHelper";

import logger from "../modules/logger";

import { createQuery } from "../modules/search/bigsi";

import { userEventEmitter } from "../modules/events";

import Constants from "../Constants";
import GroupHelper from "../helpers/GroupHelper";

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
  logger.debug(`SearchController#saveResult: enter`);
  try {
    const parser = await ResultsParserFactory.create(body);
    if (!parser) {
      return res.jerror(
        new APIError(Constants.ERRORS.UPDATE_EXPERIMENT_RESULTS, "Invalid result type")
      );
    }
    const result = parser.parse();
    logger.debug(`SearchController#saveResult: parsedResult: ${JSON.stringify(result, null, 2)}`);

    const savedSearch = await search.updateAndSetExpiry(result);

    const searchJson = new SearchJSONTransformer().transform(savedSearch);
    let regeneratedSearch;
    if (searchJson.bigsi) {
      regeneratedSearch = createQuery(searchJson.bigsi);
      logger.debug(
        `SearchController#saveResult: regeneratedSearch: ${JSON.stringify(
          regeneratedSearch,
          null,
          2
        )}`
      );
      if (regeneratedSearch && regeneratedSearch.q) {
        searchJson.bigsi.search = regeneratedSearch;
      }
    }

    logger.debug(
      `SearchController#saveResult: savedSearch: ${JSON.stringify(savedSearch, null, 2)}`
    );

    if (search && search.type) {
      const audit = (await Audit.getBySearchId(searchJson.id)) || {};
      const auditJson = new AuditJSONTransformer().transform(audit);

      // notify all users and clear the list
      try {
        await EventHelper.clearSearchesState(searchJson.id);
      } catch (e) {
        logger.error(`Unable to clear search state: ${e}`);
      }
      logger.debug(`SearchController#saveResult: notify ${search.users.length} user(s)`);
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

    logger.debug(
      `SearchController#saveResult: savedSearch: ${JSON.stringify(savedSearch, null, 2)}`
    );

    // set the bigsi only before return to avoid regenerating the hash
    if (regeneratedSearch && regeneratedSearch.q) {
      const bigsi = savedSearch.get("bigsi");
      bigsi.search = regeneratedSearch;
      savedSearch.set("bigsi", bigsi);
    }

    const group = await GroupHelper.findBySearchHash(savedSearch.hash);
    if (group) {
      // tag group experiments
      await GroupHelper.enrichGroupWithExperiments(group, savedSearch);
    }

    return res.jsend(savedSearch);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.SAVE));
  }
};

export default {
  load,
  saveResult
};
