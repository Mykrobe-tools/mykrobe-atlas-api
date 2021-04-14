import mongoose from "mongoose";
import moment from "moment";
import schemaValidator from "mongoose-jsonschema-validator";
import { search as searchJsonSchema } from "mykrobe-atlas-jsonschema";

import { APIError } from "makeandship-api-common/lib/modules/error";

import Constants from "../Constants";

import JSONMongooseSchema from "./jsonschema.model";

import SearchHelper from "../helpers/SearchHelper";
import SearchJSONTransformer from "../transformers/SearchJSONTransformer";

import config from "../../config/env";

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
    ],
    expires: {
      default: () => {
        const m = moment();
        m.add(3, "days");
        return m.toDate();
      }
    }
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

// Create a hash for a search
SearchSchema.pre("save", function() {
  this.hash = this.generateHash();
});

/**
 * Methods
 */
SearchSchema.method({
  isExpired() {
    return moment(this.expires).isBefore(moment());
  },

  async updateAndSetExpiry(result, expiresIn = config.services.bigsiResultsTTL) {
    const expires = moment();
    expires.add(expiresIn, "hours");
    this.expires = expires.toISOString();
    this.status = Constants.SEARCH_COMPLETE;
    this.set("result", result);

    return this.save();
  },

  async addUser(user) {
    if (
      !this.users.find(existingUser => {
        return existingUser._id == user._id;
      })
    ) {
      this.users.push(user);
      return this.save();
    }
    return this;
  },

  async clearUsers() {
    this.users = [];
    return this.save();
  },

  isPending() {
    return this.status === Constants.SEARCH_PENDING;
  },

  isComplete() {
    return this.status === Constants.SEARCH_COMPLETE;
  },

  userExists(user) {
    return this.users.find(element => element.id === user.id);
  },

  generateHash() {
    const data = {
      type: this.type,
      bigsi: this.bigsi
    };
    return SearchHelper.generateHash(data);
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
    return this.findOne({ _id: id })
      .populate("users")
      .exec();
  },

  /**
   * Get search by hash
   * @param {ObjectId} id - The objectId of search.
   * @returns {Promise<search, APIError>}
   */
  async findByHash(hash) {
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
