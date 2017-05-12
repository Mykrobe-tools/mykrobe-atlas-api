import Promise from 'bluebird';
import mongoose from 'mongoose';
import errors from 'errors';
import randomstring from 'randomstring';
import uniqueValidator from 'mongoose-unique-validator';
import UserJSONTransformer from '../transformers/UserJSONTransformer';
import config from '../../config/env';

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: config.usePassword()
  },
  role: {
    type: String
  },
  phone: {
    type: String,
    required: config.username === 'phone',
    unique: config.username === 'phone'
  },
  email: {
    type: String,
    required: config.username === 'email',
    unique: config.username === 'email'
  },
  resetPasswordToken: String,
  verificationToken: String,
  valid: {
    type: Boolean,
    default: false
  },
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation'
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 * - plugins
 */

UserSchema.plugin(uniqueValidator, { message: '{VALUE} has already been registered' });

UserSchema.post('save', (error, doc, next) => {
  if (error.errors) {
    const errorObject = error.errors.email || error.errors.phone;
    next(new Error(errorObject.message));
  }
  else {
    next(error);
  }
});

/**
 * Methods
 */
UserSchema.method({
  /**
   * Generate a verification token for the user
   *
   * @return {Promise} user saved with verification token
   */
  generateVerificationToken() {
    const random = randomstring.generate();

    this.verificationToken = random;
    return this.save();
  }
});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        return Promise.reject(new errors.ObjectNotFound(`User not found with id ${id}`));
      })
      .catch(e => Promise.reject(new errors.ObjectNotFound(e.message)));
  },

  /**
   * Get user by email
   * @param {String} email - The email of user.
   * @returns {Promise<User, APIError>}
   */
  getByEmail(email) {
    return this.findOne({ email })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        return Promise.reject(new errors.ObjectNotFound());
      });
  },

  /**
   * Finds and updates the user
   * @returns {Promise<User, APIError>}
   */
  findUserAndUpdate(query, newData) {
    return this.findOneAndUpdate(query, newData, { new: true })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        return Promise.reject(new errors.ObjectNotFound('No registered user with the given criteria'));
      });
  },

  /**
   * Get user by resetPasswordToken
   * @param {String} resetPasswordToken - The resetPasswordToken of user.
   * @returns {Promise<User, APIError>}
   */
  getByResetPasswordToken(resetPasswordToken) {
    return this.findOne({ resetPasswordToken })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        return Promise.reject(new errors.ObjectNotFound(`No registered user with token ${resetPasswordToken}`));
      });
  },

  /**
   * Get user by verificationToken
   * @param {String} verificationToken - The verificationToken of user.
   * @returns {Promise<User, APIError>}
   */
  getByVerificationToken(verificationToken) {
    return this.findOne({ verificationToken })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        return Promise.reject(new errors.ObjectNotFound(`No registered user with token ${verificationToken}`));
      });
  },

  /**
   * List a limit of 50 users
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

/**
 * Json transformation with shared transformer
 */
UserSchema.set('toJSON', {
  transform(doc, ret) {
    return new UserJSONTransformer(ret).transform();
  }
});

/**
 * @typedef User
 */
export default mongoose.model('User', UserSchema);
