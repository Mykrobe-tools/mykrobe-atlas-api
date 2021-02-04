import passwordHash from "password-hash";
import flatten from "flat";

import { ErrorUtil, APIError } from "makeandship-api-common/lib/modules/error";
import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";

import channels from "../modules/channels";

import User from "../models/user.model";
import Event from "../models/event.model";

import UserJSONTransformer from "../transformers/UserJSONTransformer";
import EventJSONTransformer from "../transformers/EventJSONTransformer";

import AccountsHelper from "../helpers/AccountsHelper";
import EmailHelper from "../helpers/EmailHelper";

import config from "../../config/env";

import Constants from "../Constants";

const keycloak = AccountsHelper.keycloakInstance();

/**
 * Load user and append to req.
 */
const load = async (req, res, next, id) => {
  console.log(`userController#load: enter`);
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
        return res.jerror(
          new APIError(Constants.ERRORS.CREATE_USER, "Please provide a password", {
            errors: {
              password: {
                path: "password",
                type: "required",
                message: "should have required property 'password'"
              }
            }
          })
        );
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
      return res.jerror(
        new APIError(Constants.ERRORS.CREATE_USER, "Invalid username", {
          errors: {
            username: {
              path: "username",
              type: "required",
              message: "should be a valid username"
            }
          }
        })
      );
    }

    const user = new User(userData);
    const savedUser = await user.save();
    return res.jsend(savedUser);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.CREATE_USER));
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
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.UPDATE_USER));
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
 * Get user events status
 */
const eventsStatus = async (req, res) => {
  const user = req.dbUser;
  try {
    const event = await Event.getByUserId(user.id);
    return res.jsend(new EventJSONTransformer().transform(event));
  } catch (e) {
    return res.jerror(e);
  }
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
  eventsStatus
};
