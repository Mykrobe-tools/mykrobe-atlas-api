import Promise from "bluebird";
import mongoose from "mongoose";
import errors from "errors";
import randomstring from "randomstring";
import uniqueValidator from "mongoose-unique-validator";
import schemaValidator from "mongoose-jsonschema-validator";
import { user as userJsonSchema } from "../../schemas";
import UserJSONTransformer from "../transformers/UserJSONTransformer";

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  role: String,
  phone: String,
  email: {
    type: String,
    unique: true
  },
  keycloakId: String,
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organisation"
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 * - plugins
 */

UserSchema.plugin(uniqueValidator, {
  message: "{VALUE} has already been registered"
});

UserSchema.plugin(schemaValidator, {
  jsonschema: userJsonSchema,
  modelName: "User"
});

/**
 * Methods
 */
UserSchema.method({});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      const user = await this.findById(id)
        .populate("organisation")
        .exec();
      if (user) {
        return user;
      }
      throw new errors.ObjectNotFound(`User not found with id ${id}`);
    } catch (e) {
      throw new errors.ObjectNotFound(e.message);
    }
  },

  /**
   * Get user by email
   * @param {String} email - The email of user.
   * @returns {Promise<User, APIError>}
   */
  async getByEmail(email) {
    const user = await this.findOne({ email }).exec();
    if (user) {
      return user;
    }
    throw new errors.ObjectNotFound();
  },

  /**
   * Finds and updates the user
   * @returns {Promise<User, APIError>}
   */
  async findUserAndUpdate(query, newData) {
    const user = await this.findOneAndUpdate(query, newData, {
      new: true
    }).exec();
    if (user) {
      return user;
    }
    throw new errors.ObjectNotFound(
      "No registered user with the given criteria"
    );
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
UserSchema.set("toJSON", {
  transform(doc, ret) {
    return new UserJSONTransformer().transform(ret);
  }
});

/**
 * @typedef User
 */
export default mongoose.model("User", UserSchema);
