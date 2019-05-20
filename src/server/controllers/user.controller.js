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

import AuditJSONTransformer from "../transformers/AuditJSONTransformer";
import UserJSONTransformer from "../transformers/UserJSONTransformer";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import ExperimentsResultJSONTransformer from "../transformers/es/ExperimentsResultJSONTransformer";

import AccountsHelper from "../helpers/AccountsHelper";
import EmailHelper from "../helpers/EmailHelper";

import ResultsParserFactory from "../helpers/results/ResultsParserFactory";

import config from "../../config/env";
import SearchJSONTransformer from "../transformers/SearchJSONTransformer";

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
    const { firstname, lastname, username, phone } = req.body;
    const userData = {
      firstname,
      lastname,
      username,
      phone
    };

    if (EmailHelper.isValid(username)) {
      if (!req.body.password) {
        return res.jerror("Please provide a password");
      }

      userData.email = username;

      userData.keycloakId = await keycloak.register(
        {
          email: userData.email,
          username: userData.email,
          firstName: userData.firstname,
          lastName: userData.lastname,
          attributes: { phone: userData.phone }
        },
        req.body.password
      );
    } else {
      return res.jerror("Invalid username");
    }

    const user = new User(userData);
    const savedUser = await user.save();
    return res.jsend(savedUser);
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
  user.phone = typeof req.body.phone === "undefined" ? user.phone : req.body.phone;
  user.email = typeof req.body.email === "undefined" ? user.email : req.body.email;

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

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  assignRole,
  loadCurrentUser,
  events
};
