import passwordHash from "password-hash";
import errors from "errors";
import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";
import User from "../models/user.model";
import UserJSONTransformer from "../transformers/UserJSONTransformer";
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
    return res.jerror(new errors.UpdateUserError(e.message));
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

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  assignRole,
  loadCurrentUser
};
