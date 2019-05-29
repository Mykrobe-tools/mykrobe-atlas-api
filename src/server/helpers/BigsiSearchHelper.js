import flatten from "flat";

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
      const mergedExperiments = await this.mergeWithExperiments(search, query);
      search.set("result", mergedExperiments);
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
    console.log(searchData);
    const newSearch = search || new Search(searchData);

    // set status to pending and clear old result
    newSearch.status = Constants.SEARCH_PENDING;
    newSearch.set("result", {});

    try {
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
    } catch (e) {
      console.log(e);
      return null;
    }
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
  static async mergeWithExperiments(search, query) {
    const mergedExperiments = [];
    const result = search.get("result") || {};

    let isolateIds = [];
    if (result.result) {
      isolateIds = Object.keys(result.result);
    }

    // from ES
    let searchQuery = { "metadata.sample.isolateId": isolateIds };
    if (query && Object.keys(query).length > 0) {
      Object.assign(searchQuery, flatten(query));
    }

    const resp = await ElasticsearchHelper.search(config, searchQuery, "experiment");

    const experiments = new ExperimentsResultJSONTransformer().transform(resp, {});

    // merge results
    isolateIds.forEach(isolateId => {
      let mergedExperiment = {};
      try {
        const exp = experiments.filter(item => item.metadata.sample.isolateId === isolateId);

        mergedExperiment = exp[0];
        mergedExperiment.results = mergedExperiment.results || {};
        mergedExperiment.results.bigsi = result.result[isolateId];
      } catch (e) {}
      if (mergedExperiment) {
        mergedExperiments.push(mergedExperiment);
      }
    });

    result.experiments = mergedExperiments;

    delete result.result;

    return result;
  }
}

export default BigsiSearchHelper;
