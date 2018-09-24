import mongoose from "mongoose";
import errors from "errors";
import schemaValidator from "mongoose-jsonschema-validator";
import { search as searchJsonSchema } from "mykrobe-atlas-jsonschema";
import SearchJSONTransformer from "../transformers/SearchJSONTransformer";
import config from "../../config/env";

/**
 * SearchSchema Schema
 */
const SearchSchema = new mongoose.Schema(
  {
    type: String,
    status: String,
    expires: Date,
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
      const search = await this.findById(id).exec();
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
  async findByHash(hash) {
    try {
      const search = await this.findOne({ hash }).exec();
      if (search) {
        return search;
      }
      throw new errors.ObjectNotFound(`Search not found with hash ${hash}`);
    } catch (e) {
      throw new errors.ObjectNotFound(e.message);
    }
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
