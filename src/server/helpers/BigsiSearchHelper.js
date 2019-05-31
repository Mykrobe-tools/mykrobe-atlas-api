import flatten from "flat";
import deepmerge from "deepmerge";

import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch/";

import Constants from "../Constants";

import SearchHelper from "./SearchHelper";

import Search from "../models/search.model";
import Audit from "../models/audit.model";

import AuditJSONTransformer from "../transformers/AuditJSONTransformer";
import SearchJSONTransformer from "../transformers/SearchJSONTransformer";
import UserJSONTransformer from "../transformers/UserJSONTransformer";
import ExperimentsResultJSONTransformer from "../transformers/es/ExperimentsResultJSONTransformer";

import { userEventEmitter } from "../modules/events";
import { schedule } from "../modules/agenda";

const config = require("../../config/env");

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

    const searchHash = SearchHelper.generateHash(searchData);
    const search = await Search.findByHash(searchHash);

    if (search && (!search.isExpired() || search.isPending())) {
      return this.returnCachedResults(search, query, user);
    } else {
      return this.triggerBigsiSearch(search, user, searchData);
    }
  }

  /**
   * The cache search engine
   * Return whatever we have in the cache
   * Notify a user if the search is pending and the user wasnt already notified
   * If result is complete merge it with experiments
   * @param {*} search
   * @param {*} user
   */
  static async returnCachedResults(search, query, user) {
    if (search.isPending() && !search.userExists(user)) {
      await this.addAndNotifyUser(search, user);
    } else if (!search.isPending()) {
      const result = search.get("result");

      const results = result.results;

      const experiments = await this.enhanceBigsiResultsWithExperiments(results, query);
      result.results = experiments;

      search.set("result", result);
    }

    return search;
  }

  /**
   * The remote search engine
   * Called when there is no search or the existing search is expired
   * Set the status to pending and clear the search result (if exists)
   * Schedule the agenda job to call the bigsi service
   * @param {*} search
   * @param {*} user
   * @param {*} searchHash
   * @param {*} searchData
   */
  static async triggerBigsiSearch(search, user, searchData) {
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
    // call bigsi via agenda to support retries
    await schedule("now", "call search api", {
      search: searchJson,
      user: userJson
    });
    return savedSearch;
  }

  /**
   * Adds a user to the search and notifies them
   * This is normally called when a user makes a search that is already pending
   * @param {*} search
   * @param {*} user
   */
  static async addAndNotifyUser(search, user) {
    await search.addUser(user);
    const audit = await Audit.getBySearchId(search.id);
    const searchJson = new SearchJSONTransformer().transform(search);
    const userJson = new UserJSONTransformer().transform(user);
    if (audit) {
      const auditJson = new AuditJSONTransformer().transform(audit);
      const event = `${search.type}-search-started`;
      userEventEmitter.emit(event, {
        audit: auditJson,
        user: userJson,
        search: searchJson
      });
    }
  }

  /**
   * Merge results with experiments from elasticsearch
   * Search experiments by id and filter by search query
   * @param {*} search
   * @param {*} query
   */
  static async enhanceBigsiResultsWithExperiments(results, query) {
    const isolateIds =
      results && Array.isArray(results) && results.length
        ? results.map(r => r["metadata.sample.isolateId"])
        : [];

    // filter by isolateIds
    const isolateQuery = { "metadata.sample.isolateId": isolateIds, per: isolateIds.length };

    // include any elasticsearch side query filters
    const elasticQuery =
      query && Object.keys(query).length > 0
        ? Object.assign(isolateQuery, flatten(query))
        : isolateQuery;
    console.log(`elasticQuery: ${JSON.stringify(elasticQuery, null, 2)}`);
    const resp = await ElasticsearchHelper.search(config, elasticQuery, "experiment");
    console.log(`resp: ${JSON.stringify(resp, null, 2)}`);
    const experiments = new ExperimentsResultJSONTransformer().transform(resp, {});

    // merge results in order
    const hits = [];
    isolateIds.forEach(isolateId => {
      const match = experiments.find(item => {
        return item.metadata.sample.isolateId === isolateId;
      });

      const bigsi =
        results && Array.isArray(results) && results.length
          ? results.find(item => item["metadata.sample.isolateId"] === isolateId)
          : null;

      if (bigsi && bigsi["metadata.sample.isolateId"]) {
        delete bigsi["metadata.sample.isolateId"];
      }

      // merge result data and handle nulls
      if (match && bigsi) {
        const hit = deepmerge(bigsi, match);
        hits.push(hit);
      }
    });

    return hits;
  }
}

export default BigsiSearchHelper;
