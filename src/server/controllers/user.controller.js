import passwordHash from 'password-hash';
import errors from 'errors';
import User from '../models/user.model';
import ArrayJSONTransformer from '../transformers/ArrayJSONTransformer';
import UserJSONTransformer from '../transformers/UserJSONTransformer';

const config = require('../../config/env');

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.dbUser = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => res.jerror(e));
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
function create(req, res) {
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
  user.save()
    .then(savedUser => savedUser.generateVerificationToken())
    .then((userWithToken) => {
      queue.enqueue('welcome', { token: userWithToken.verificationToken, to: userWithToken.email }, () => res.jsend(userWithToken));
    })
    .catch(e => res.jerror(new errors.CreateUserError(e.message)));
}

/**
 * Update existing user
 * @property {string} req.body.firstname - The firstname of user.
 * @property {string} req.body.lastname - The lastname of user.
 * @returns {User}
 */
function update(req, res) {
  const user = req.dbUser;
  user.firstname = req.body.firstname || user.firstname;
  user.lastname = req.body.lastname || user.lastname;
  user.phone = typeof req.body.phone === 'undefined' ? user.phone : req.body.phone;
  user.email = typeof req.body.email === 'undefined' ? user.email : req.body.email;

  user.save({ lean: true })
    .then(savedUser => res.jsend(new UserJSONTransformer(savedUser).transform()))
    .catch(e => res.jerror(new errors.UpdateUserError(e.message)));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res) {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then((users) => {
      const transformer = new ArrayJSONTransformer(users, { transformer: UserJSONTransformer });
      res.jsend(transformer.transform());
    })
    .catch(e => res.jerror(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res) {
  const user = req.dbUser;
  user.remove()
    .then(() => res.jsend('Account was successfully deleted.'))
    .catch(e => res.jerror(e));
}

/**
 * Make user an admin.
 * @returns {User}
 */
function assignRole(req, res) {
  const user = req.dbUser;
  user.role = config.adminRole;
  user.save()
    .then(savedUser => res.jsend(new UserJSONTransformer(savedUser.toObject()).transform()))
    .catch(e => res.jerror(e));
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
