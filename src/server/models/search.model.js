import mongoose from "mongoose";
import errors from "errors";
import schemaValidator from "mongoose-jsonschema-validator";
import { search as searchJsonSchema } from "mykrobe-atlas-jsonschema";
import SearchJSONTransformer from "../transformers/SearchJSONTransformer";
import config from "../../config/env";

const PENDING = "pending";

/**
 * SearchSchema Schema
 */
const SearchSchema = new mongoose.Schema(
  {
    type: String,
    status: {
      type: String,
      default: PENDING
    },
    expires: {
      type: Date,
      default: new Date()
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    hash: String
  },
  {
    strict: false,
    timestamps: {
      createdAt: "created",
      updatedAt: "modified"
    }
  }
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 * - plugins
 */

SearchSchema.plugin(schemaValidator, {
  jsonschema: searchJsonSchema,
  modelName: "Search"
});

/**
 * Methods
 */
SearchSchema.method({
  isExpired() {
    return this.expires < new Date();
  },

  async saveResult(result, expiresIn = config.services.bigsiResultsDaysToLive) {
    const expires = new Date();
    expires.setDate(expires.getDate() + expiresIn);
    this.expires = expires;
    this.status = "complete";
    this.set("result", result);
    return this.save();
  },

  async addUser(user) {
    this.users.push(user);
    return this.save();
  },

  async clearUsers() {
    this.users = [];
    return this.save();
  },

  isPending() {
    return this.status === PENDING;
  },

  userExists(user) {
    return this.users.find(element => element.id === user.id);
  }
});

/**
 * Statics
 */
SearchSchema.statics = {
  /**
   * Get search by id
   * @param {ObjectId} id - The objectId of search.
   * @returns {Promise<search, APIError>}
   */
  async get(id) {
    try {
      const search = await this.findById(id)
        .populate("users")
        .exec();
      if (search) {
        return search;
      }
      throw new errors.ObjectNotFound(`Search not found with id ${id}`);
    } catch (e) {
      throw new errors.ObjectNotFound(e.message);
    }
  },

  /**
   * Get search by hash
   * @param {ObjectId} id - The objectId of search.
   * @returns {Promise<search, APIError>}
   */
  findByHash(hash) {
    return this.findOne({ hash })
      .populate("users")
      .exec();
  }
};

/**
 * Json transformation with shared transformer
 */
SearchSchema.set("toJSON", {
  transform(doc, ret) {
    return new SearchJSONTransformer().transform(ret);
  }
});

/**
 * @typedef SearchSchema
 */
export default mongoose.model("Search", SearchSchema);
