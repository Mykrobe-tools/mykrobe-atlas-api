import { ErrorUtil, APIError } from "makeandship-api-common/lib/modules/error";

import Search from "../models/search.model";
import Audit from "../models/audit.model";
import Group from "../models/group.model";

import SearchJSONTransformer from "../transformers/SearchJSONTransformer";
import AuditJSONTransformer from "../transformers/AuditJSONTransformer";
import UserJSONTransformer from "../transformers/UserJSONTransformer";

import ResultsParserFactory from "../helpers/results/ResultsParserFactory";
import EventHelper from "../helpers/events/EventHelper";

import logger from "../modules/logging/logger";

import { createQuery } from "../modules/search/bigsi";

import { userEventEmitter } from "../modules/events";

import Constants from "../Constants";
import GroupHelper from "../helpers/GroupHelper";
import GroupsInitializer from "../initializers/GroupsInitializer";

import BigsiCache from "../modules/cache/BigsiCache";

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
    logger.debug(`SearchController#saveResult: 0`);
    logger.debug(`SearchController#saveResult: parsedResult: ${JSON.stringify(result, null, 2)}`);

    const savedSearch = await search.updateAndSetExpiry();
    BigsiCache.setResult(savedSearch.hash, result);

    logger.debug(`SearchController#saveResult: 1`);

    const searchJson = new SearchJSONTransformer().transform(savedSearch);
    logger.debug(`SearchController#saveResult: 2`);
    let regeneratedSearch;
    if (searchJson.bigsi) {
      logger.debug(`SearchController#saveResult: 3`);
      regeneratedSearch = createQuery(searchJson.bigsi);
      logger.debug(`SearchController#saveResult: 4`);
      logger.debug(
        `SearchController#saveResult: regeneratedSearch: ${JSON.stringify(
          regeneratedSearch,
          null,
          2
        )}`
      );
      logger.debug(`SearchController#saveResult: 5`);
      if (regeneratedSearch && regeneratedSearch.q) {
        logger.debug(`SearchController#saveResult: 6`);
        searchJson.bigsi.search = regeneratedSearch;
      }
    }

    logger.debug(`SearchController#saveResult: 7`);
    logger.debug(
      `SearchController#saveResult: savedSearch: ${JSON.stringify(savedSearch, null, 2)}`
    );

    if (search && search.type) {
      logger.debug(`SearchController#saveResult: 8`);
      const audit = (await Audit.getBySearchId(searchJson.id)) || {};
      logger.debug(`SearchController#saveResult: 9`);
      const auditJson = new AuditJSONTransformer().transform(audit);
      logger.debug(`SearchController#saveResult: 10`);

      // notify all users and clear the list
      try {
        logger.debug(`SearchController#saveResult: 11`);
        await EventHelper.clearSearchesState(searchJson.id);
        logger.debug(`SearchController#saveResult: 12`);
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
      logger.debug(`SearchController#saveResult: 13`);
      await savedSearch.clearUsers();
    }

    logger.debug(
      `SearchController#saveResult: savedSearch: ${JSON.stringify(savedSearch, null, 2)}`
    );

    // set the bigsi only before return to avoid regenerating the hash
    if (regeneratedSearch && regeneratedSearch.q) {
      logger.debug(`SearchController#saveResult: 14`);
      const bigsi = savedSearch.get("bigsi");
      logger.debug(`SearchController#saveResult: 15`);
      bigsi.search = regeneratedSearch;
      savedSearch.set("bigsi", bigsi);
      logger.debug(`SearchController#saveResult: 16`);
    }

    const groups = await Group.findBySearch(savedSearch);
    logger.debug(`SearchController#saveResult: 16`);
    if (groups && groups.length > 0) {
      logger.debug(`SearchController#saveResult: 18`);
      groups.forEach(
        async group => await GroupHelper.enrichGroupWithExperiments(group, savedSearch)
      );
      logger.debug(`SearchController#saveResult: 19`);
    }

    logger.debug(`SearchController#saveResult: 20`);
    return res.jsend(savedSearch);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.SAVE));
  }
};

export default {
  load,
  saveResult
};
