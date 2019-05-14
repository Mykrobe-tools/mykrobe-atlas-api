import mongoose from "mongoose";
import errors from "errors";
import moment from "moment";
import schemaValidator from "mongoose-jsonschema-validator";

import { search as searchJsonSchema } from "mykrobe-atlas-jsonschema";

import JSONMongooseSchema from "./jsonschema.model";

import SearchJSONTransformer from "../transformers/SearchJSONTransformer";

import config from "../../config/env";

// constants
const PENDING = "pending";
const COMPLETE = "complete";

/**
 * SearchSchema Schema
 */
const SearchSchema = new JSONMongooseSchema(
  searchJsonSchema,
  {
    users: [
      {
        type: "ObjectId",
        ref: "User"
      }
    ]
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
    return moment(this.expires).isBefore(moment());
  },

  async updateAndSetExpiry(result, expiresIn = config.services.bigsiResultsTTL) {
    console.log(expiresIn);
    const expires = moment();
    console.log(`before: ${expires}`);
    expires.add(expiresIn, "hours");
    console.log(`after: ${expires}`);
    this.expires = expires.toISOString();
    console.log(`model: ${this.expires}`);
    this.status = COMPLETE;
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
  },

  constants() {
    return { PENDING, COMPLETE };
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
