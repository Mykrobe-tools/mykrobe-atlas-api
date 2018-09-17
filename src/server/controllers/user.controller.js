import passwordHash from "password-hash";
import errors from "errors";
import flatten from "flat";

import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch/";
import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";

import { userEventEmitter } from "../modules/events";
import channels from "../modules/channels";

import Audit from "../models/audit.model";
import Experiment from "../models/experiment.model";
import Search from "../models/search.model";
import User from "../models/user.model";

import UserJSONTransformer from "../transformers/UserJSONTransformer";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import ExperimentsResultJSONTransformer from "../transformers/es/ExperimentsResultJSONTransformer";

import AccountsHelper from "../helpers/AccountsHelper";
import MonqHelper from "../helpers/MonqHelper";

import config from "../../config/env";

const keycloak = AccountsHelper.keycloakInstance();

/**
 * Load user and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.dbUser = user;
    return next();
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Load searchResult and append to req.
 */
const loadSearchResult = async (req, res, next, id) => {
  try {
    const searchResult = await Search.get(id);
    req.searchResult = searchResult;
    return next();
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Load current user and append to req.
 */
const loadCurrentUser = (req, res, next) => load(req, res, next, req.user.id);
/**
 * Get user
 * @returns {User}
 */
const get = (req, res) => res.jsend(req.dbUser);

/**
 * Create new user
 * @property {string} req.body.firstname - The firstname of user.
 * @property {string} req.body.lastname - The lastname of user.
 * @property {string} req.body.profile - The profile of user.
 * @returns {User}
 */
const create = async (req, res) => {
  try {
    const { firstname, lastname, phone, email } = req.body;
    const keycloakId = await keycloak.register(
      { email, username: email, firstName: firstname, lastName: lastname },
      req.body.password
    );
    const user = new User({ firstname, lastname, phone, email, keycloakId });
    const savedUser = await user.save();
    res.jsend(savedUser);
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Update existing user
 * @property {string} req.body.firstname - The firstname of user.
 * @property {string} req.body.lastname - The lastname of user.
 * @returns {User}
 */
const update = async (req, res) => {
  const user = req.dbUser;
  user.firstname = req.body.firstname || user.firstname;
  user.lastname = req.body.lastname || user.lastname;
  user.phone =
    typeof req.body.phone === "undefined" ? user.phone : req.body.phone;
  user.email =
    typeof req.body.email === "undefined" ? user.email : req.body.email;

  try {
    const savedUser = await user.save({ lean: true });
    return res.jsend(new UserJSONTransformer().transform(savedUser));
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
const list = async (req, res) => {
  const { limit = 50, skip = 0 } = req.query;
  try {
    const users = await User.list({ limit, skip });
    const transformer = new ArrayJSONTransformer();
    return res.jsend(
      transformer.transform(users, {
        transformer: UserJSONTransformer
      })
    );
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Delete user.
 * @returns {User}
 */
const remove = async (req, res) => {
  const user = req.dbUser;
  try {
    await user.remove();
    return res.jsend("Account was successfully deleted.");
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Make user an admin.
 * @returns {User}
 */
const assignRole = async (req, res) => {
  const user = req.dbUser;
  user.role = config.accounts.adminRole;
  try {
    const savedUser = await user.save();
    return res.jsend(new UserJSONTransformer().transform(savedUser.toObject()));
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Get user events
 */
const events = async (req, res) => {
  res.set({
    "X-Accel-Buffering": "no"
  });
  const channel = await channels.getUserChannel(req.dbUser.id);
  channel.addClient(req, res);
};

/**
 * Store search results
 * @param {object} req
 * @param {object} res
 */
const saveResults = async (req, res) => {
  const { user, searchResult } = req;
  console.log("a");
  if (
    !user ||
    !searchResult ||
    !searchResult.user ||
    !user.id ||
    !searchResult.user.id ||
    searchResult.user.id !== user.id
  ) {
    return res.jerror("User must be the owner of the search result");
  }
  try {
    console.log("b");
    const result = req.body;
    searchResult.set("result", result);
    const savedSearchResult = await searchResult.save();
    console.log("c");
    if (result && result.type) {
      console.log("d");
      console.log(`Search result id: ${savedSearchResult.id}`);
      const audit = await Audit.getBySearchId(savedSearchResult.id);
      console.log("e");
      const event = `${result.type}-complete`;
      console.log("f");
      userEventEmitter.emit(event, {
        user,
        search: searchResult,
        audit
      });
      console.log("g");
    }

    return res.jsend(savedSearchResult);
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Read search results
 * @param {object} req
 * @param {object} res
 */
const readResults = async (req, res) => {
  const { user, searchResult } = req;

  if (
    !user ||
    !searchResult ||
    !searchResult.user ||
    !user.id ||
    !searchResult.user.id ||
    searchResult.user.id !== user.id
  ) {
    return res.jerror("User must be the owner of the search result");
  }
  try {
    const mergedExperiments = await mergeWithExperiments(searchResult);
    searchResult.set("result", mergedExperiments);
    return res.jsend(searchResult);
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Merge result with experiments
 * @param {*} result
 */
const mergeWithExperiments = async searchResult => {
  const mergedExperiments = [];
  const result = searchResult.get("result") || {};
  const search = searchResult.get("search");
  let experimentIds = [];
  if (result.result) {
    experimentIds = Object.keys(result.result);
  }

  // from ES
  let query = { ids: experimentIds };
  if (search && Object.keys(search).length > 0) {
    Object.assign(query, flatten(search));
  }

  const resp = await ElasticsearchHelper.search(config, query, "experiment");

  const experiments = new ExperimentsResultJSONTransformer().transform(
    resp,
    {}
  );

  // merge results
  experimentIds.forEach(id => {
    let mergedExperiment = {};
    try {
      const exp = experiments.filter(item => item.id === id);
      mergedExperiment = exp[0];
      mergedExperiment.results = mergedExperiment.results || {};
      mergedExperiment.results.bigsi = result.result[id];
    } catch (e) {}
    if (mergedExperiment) {
      mergedExperiments.push(mergedExperiment);
    }
  });

  result.experiments = mergedExperiments;

  delete result.result;

  return result;
};

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  assignRole,
  loadCurrentUser,
  events,
  saveResults,
  loadSearchResult,
  readResults
};
