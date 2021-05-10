import flatten from "flat";
import deepmerge from "deepmerge";

import { ElasticService } from "makeandship-api-common/lib/modules/elasticsearch/";
import { SearchQuery } from "makeandship-api-common/lib/modules/elasticsearch/";
import { experimentSearch as experimentSearchSchema } from "mykrobe-atlas-jsonschema";

import Constants from "../Constants";

import SearchHelper from "./SearchHelper";

import Search from "../models/search.model";
import Audit from "../models/audit.model";

import AuditJSONTransformer from "../transformers/AuditJSONTransformer";
import SearchJSONTransformer from "../transformers/SearchJSONTransformer";
import UserJSONTransformer from "../transformers/UserJSONTransformer";
import ExperimentsResultJSONTransformer from "../transformers/es/ExperimentsResultJSONTransformer";

import { userEventEmitter } from "../modules/events";
import Scheduler from "../modules/scheduler/Scheduler";
import EventHelper from "./events/EventHelper";
import logger from "../modules/logging/logger";

import BigsiCache from "../modules/cache/BigsiCache";

const config = require("../../config/env");

const esConfig = { type: "experiment", ...config.elasticsearch };
const elasticService = new ElasticService(esConfig, experimentSearchSchema);

class BigsiSearchHelper {
  /**
   * The search engine
   * Return from remote when there is no search object with the same hash
   * Return from remote when there is a complete search object but expired
   * Return from cache when there is a pending search already
   * Return from cache when there is a complete search and not expired
   * @param {*} bigsi
   * @param {*} user
   */
  static async search(bigsi, query, user) {
    const searchData = {
      type: bigsi.type,
      bigsi: bigsi
    };
    logger.debug(`BigsiSearchHelper#search: bigsi: ${JSON.stringify(bigsi, null, 2)}`);
    logger.debug(`BigsiSearchHelper#search: query: ${JSON.stringify(query, null, 2)}`);

    const searchHash = SearchHelper.generateHash(searchData);
    logger.debug(`BigsiSearchHelper#search: hash: ${JSON.stringify(searchHash, null, 2)}`);
    const search = await Search.findByHash(searchHash);
    logger.debug(`BigsiSearchHelper#search: search: ${JSON.stringify(search, null, 2)}`);

    if (search && (!search.isExpired() || search.isPending())) {
      logger.debug(`Search exists and is waiting for results`);
      if (search.isPending() && !search.userExists(user)) {
        return this.addAndNotifyUser(search, user);
      } else if (!search.isPending()) {
        logger.debug(
          `BigsiSearchHelper#search: get cached samples: ${JSON.stringify(search, null, 2)}`
        );
        const cachedSampleIds = await this.getCachedResultSampleIds(search);
        logger.debug(
          `BigsiSearchHelper#search: cachedSampleIds: ${JSON.stringify(cachedSampleIds, null, 2)}`
        );
        const experiments = await this.queryElasticsearch(cachedSampleIds, query, user);
        logger.debug(
          `BigsiSearchHelper#search: experiments: ${JSON.stringify(experiments, null, 2)}`
        );
        const mergedSearch = await this.mergeResults(search, experiments);
        logger.debug(
          `BigsiSearchHelper#search: mergedSearch: ${JSON.stringify(mergedSearch, null, 2)}`
        );
        return { search: mergedSearch, total: cachedSampleIds.length };
      }
      return { search, total: 0 };
    } else {
      logger.debug(`Search does not exist`);
      return this.triggerBigsiSearch(search, query, user, searchData);
    }
  }

  /**
   * Returns cached sampleIds array
   * @param {*} search
   * @returns
   */
  static async getCachedResultSampleIds(search) {
    const result = await BigsiCache.getResult(search.hash);
    const filteredResults = this.filter(search.type, result.results);
    return filteredResults && Array.isArray(filteredResults) && filteredResults.length
      ? filteredResults.map(r => r.sampleId)
      : [];
  }

  /**
   * Query elasticsearch to get matching experiments
   * @param {*} sampleIds
   * @param {*} query
   * @param {*} user
   * @returns
   */
  static async queryElasticsearch(sampleIds, query, user) {
    const experimentsBySampleId = {};

    // filter by sampleId
    const sampleQuery = { sampleId: sampleIds };

    // include any elasticsearch side query filters
    const elasticQuery =
      query && Object.keys(query).length > 0
        ? Object.assign(sampleQuery, flatten(query))
        : sampleQuery;

    const searchQuery = new SearchQuery(elasticQuery, experimentSearchSchema);
    const resp = await elasticService.search(searchQuery, {});
    const experiments = new ExperimentsResultJSONTransformer().transform(resp, {
      currentUser: user
    });

    for (const experiment of experiments) {
      const sampleId = experiment.sampleId;
      experimentsBySampleId[sampleId] = experiment;
    }

    return experimentsBySampleId;
  }

  /**
   * Merge experiments with Bigsi results
   * @param {*} search
   * @param {*} experiments
   * @returns
   */
  static async mergeResults(search, experiments) {
    const cachedResult = await BigsiCache.getResult(search.hash);
    const results = cachedResult.results;

    const hits = [];
    for (const result of results) {
      const sampleId = result.sampleId;
      const match = sampleId ? experiments[sampleId] : null;
      const hit = match ? deepmerge(result, match) : result;
      hits.push(hit);
    }

    cachedResult.results = hits;

    search.result = cachedResult;

    return search;
  }

  /**
   * Filter results to remove any non matches
   *
   * @param type
   * @param results
   *
   * @return filtered results
   */
  static filter(type, results) {
    if (type && results) {
      switch (type) {
        case "protein-variant":
          return results.filter(result => {
            return !result.genotype || result.genotype !== "0/0";
          });
          break;
        case "dna-variant":
          return results.filter(result => {
            return !result.genotype || result.genotype !== "0/0";
          });
          break;
      }
    }
    return results;
  }

  /**
   * The remote search engine
   * Called when there is no search or the existing search is expired
   * Set the status to pending and clear the search result (if exists)
   * Schedule the agenda job to call the bigsi service
   * @param {*} search
   * @param {*} query
   * @param {*} user
   * @param {*} searchData
   */
  static async triggerBigsiSearch(search, query, user, searchData) {
    logger.debug(`triggerBigsiSearch: searchData: ${JSON.stringify(searchData)}`);
    logger.debug(`triggerBigsiSearch: query: ${JSON.stringify(query)}`);

    const newSearch = search || new Search(searchData);

    // set status to pending and clear old result
    newSearch.status = Constants.SEARCH_PENDING;
    newSearch.set("result", {});

    const savedSearch = await newSearch.save();

    if (!savedSearch.userExists(user)) {
      await savedSearch.addUser(user);
    }
    const searchJson = new SearchJSONTransformer().transform(savedSearch);
    const userJson = new UserJSONTransformer().transform(user);

    try {
      await EventHelper.updateSearchesState(userJson.id, searchJson);
    } catch (e) {
      logger.error(`Unable to save search state: ${e}`);
    }
    logger.debug(`Schedule a search`);
    // call bigsi via scheduler to support retries
    const scheduler = await Scheduler.getInstance();
    await scheduler.schedule("now", "call search api", {
      search: searchJson,
      user: userJson
    });
    logger.debug(`Search scheduled`);

    // capture query attributes before returning
    // save after scheduler as agenda has issues with dot notation in attributes
    if (!savedSearch.query && query) {
      savedSearch.set("query", query);
      await savedSearch.save();
    }
    return { search: savedSearch, total: 0 };
  }

  /**
   * Adds a user to the search and notifies them
   * This is normally called when a user makes a search that is already pending
   * @param {*} search
   * @param {*} user
   */
  static async addAndNotifyUser(search, user) {
    logger.debug(`BigsiSearchHelper#addAndNotifyUser: search: ${search}`);
    logger.debug(`BigsiSearchHelper#addAndNotifyUser: user: ${user}`);
    if (search && user) {
      await search.addUser(user);
      logger.debug(`BigsiSearchHelper#addAndNotifyUser: user added`);
      const audit = await Audit.getBySearchId(search.id);
      logger.debug(`BigsiSearchHelper#addAndNotifyUser: audit: ${JSON.stringify(audit)}`);
      if (audit) {
        const searchJson = new SearchJSONTransformer().transform(search);
        const userJson = new UserJSONTransformer().transform(user);
        const auditJson = new AuditJSONTransformer().transform(audit);

        const event = `${search.type}-search-started`;
        logger.debug(
          `BigsiSearchHelper#addAndNotifyUser: userEventEmitter: ${JSON.stringify(
            userEventEmitter
          )}`
        );
        userEventEmitter.emit(event, {
          audit: auditJson,
          user: userJson,
          search: searchJson
        });
      }
    }

    return { search, total: 0 };
  }
}

export default BigsiSearchHelper;
