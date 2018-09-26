import hash from "object-hash";

import Search from "../models/search.model";
import Audit from "../models/audit.model";

import AuditJSONTransformer from "../transformers/AuditJSONTransformer";
import SearchJSONTransformer from "../transformers/SearchJSONTransformer";
import UserJSONTransformer from "../transformers/UserJSONTransformer";

import { userEventEmitter } from "../modules/events";
import { schedule } from "../modules/agenda";

// pending status
const PENDING = "pending";

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
  static async search(bigsi, user) {
    const searchData = {
      type: bigsi.type,
      bigsi: bigsi
    };
    const searchHash = hash(searchData);
    const search = await Search.findByHash(searchHash);
    if (search && (!search.isExpired() || search.isPending())) {
      return this.searchFromCache(search, user);
    } else {
      return this.searchFromRemote(search, user, searchHash, searchData);
    }
  }

  /**
   * The cache search engine
   * Return whatever we have in the cache
   * Notify a user if the search is pending and the user wasnt already notified
   * @param {*} search
   * @param {*} user
   */
  static async searchFromCache(search, user) {
    if (search.isPending() && !search.userExists(user)) {
      await this.addAndNotifyUser(search, user);
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
  static async searchFromRemote(search, user, searchHash, searchData) {
    const newSearch = search || new Search({ hash: searchHash, ...searchData });

    // set status to pending and clear old result
    newSearch.status = PENDING;
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
}

export default BigsiSearchHelper;
