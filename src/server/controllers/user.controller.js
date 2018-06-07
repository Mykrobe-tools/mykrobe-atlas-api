import passwordHash from "password-hash";
import errors from "errors";
import User from "../models/user.model";
import ArrayJSONTransformer from "../transformers/ArrayJSONTransformer";
import UserJSONTransformer from "../transformers/UserJSONTransformer";

const config = require("../../config/env");

/**
 * Load user and append to req.
 */
async function load(req, res, next, id) {
  try {
    const user = await User.get(id);
    req.dbUser = user;
    return next();
  } catch (e) {
    return res.jerror(e);
  }
}

/**
 * Load current user and append to req.
 */
function loadCurrentUser(req, res, next) {
  return load(req, res, next, req.user.id);
}
/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.jsend(req.dbUser);
}

/**
 * Create new user
 * @property {string} req.body.firstname - The firstname of user.
 * @property {string} req.body.lastname - The lastname of user.
 * @property {string} req.body.profile - The profile of user.
 * @returns {User}
 */
async function create(req, res) {
  const user = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
    email: req.body.email
  });
  if (config.usePassword()) {
    user.password = passwordHash.generate(req.body.password);
  }
  const queue = config.monqClient.queue(config.notification);
  try {
    const savedUser = await user.save();
    const userWithToken = await savedUser.generateVerificationToken();
    queue.enqueue(
      "welcome",
      { token: userWithToken.verificationToken, to: userWithToken.email },
      () => res.jsend(userWithToken)
    );
  } catch (e) {
    return res.jerror(new errors.CreateUserError(e.message));
  }
}

/**
 * Update existing user
 * @property {string} req.body.firstname - The firstname of user.
 * @property {string} req.body.lastname - The lastname of user.
 * @returns {User}
 */
async function update(req, res) {
  const user = req.dbUser;
  user.firstname = req.body.firstname || user.firstname;
  user.lastname = req.body.lastname || user.lastname;
  user.phone =
    typeof req.body.phone === "undefined" ? user.phone : req.body.phone;
  user.email =
    typeof req.body.email === "undefined" ? user.email : req.body.email;

  try {
    const savedUser = await user.save({ lean: true });
    return res.jsend(new UserJSONTransformer(savedUser).transform());
  } catch (e) {
    return res.jerror(new errors.UpdateUserError(e.message));
  }
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
async function list(req, res) {
  const { limit = 50, skip = 0 } = req.query;
  try {
    const users = await User.list({ limit, skip });
    const transformer = new ArrayJSONTransformer(users, {
      transformer: UserJSONTransformer
    });
    return res.jsend(transformer.transform());
  } catch (e) {
    return res.jerror(e);
  }
}

/**
 * Delete user.
 * @returns {User}
 */
async function remove(req, res) {
  const user = req.dbUser;
  try {
    await user.remove();
    return res.jsend("Account was successfully deleted.");
  } catch (e) {
    return res.jerror(e);
  }
}

/**
 * Make user an admin.
 * @returns {User}
 */
async function assignRole(req, res) {
  const user = req.dbUser;
  user.role = config.adminRole;
  try {
    const savedUser = await user.save();
    return res.jsend(new UserJSONTransformer(savedUser.toObject()).transform());
  } catch (e) {
    return res.jerror(e);
  }
}

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
