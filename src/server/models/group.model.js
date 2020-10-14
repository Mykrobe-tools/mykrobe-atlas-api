import mongoose from "mongoose";
import schemaValidator from "mongoose-jsonschema-validator";
import { group as groupJsonSchema } from "mykrobe-atlas-jsonschema";
import { APIError } from "makeandship-api-common/lib/modules/error";
import Constants from "../Constants";
import JSONMongooseSchema from "./jsonschema.model";
import GroupJSONTransformer from "../transformers/GroupJSONTransformer";
import SearchHelper from "../helpers/SearchHelper";

/**
 * GroupSchema Schema
 */
const GroupSchema = new JSONMongooseSchema(
  groupJsonSchema,
  {
    experiments: [
      {
        type: "ObjectId",
        ref: "Experiment"
      }
    ]
  },
  {
    strict: false
  }
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 * - plugins
 */

GroupSchema.plugin(schemaValidator, {
  jsonschema: groupJsonSchema,
  modelName: "Group"
});

// Create a hash for a search
GroupSchema.pre("save", function() {
  this.searchHash = this.generateHash(this.searchQuery || {});
});

/**
 * Methods
 */
GroupSchema.method({
  generateHash(searchQuery) {
    const { type, bigsi } = searchQuery;
    return SearchHelper.generateHash({ type, bigsi });
  }
});

/**
 * Statics
 */
GroupSchema.statics = {
  /**
   * Get group by id
   * @param {ObjectId} id - The objectId of group.
   * @returns {Promise<group, APIError>}
   */
  async get(id) {
    try {
      const group = await this.findById(id)
        .populate("experiments")
        .exec();
      if (group) {
        return group;
      }
      throw new APIError(Constants.ERRORS.GET_GROUP, `Group not found with id ${id}`);
    } catch (e) {
      throw new APIError(Constants.ERRORS.GET_GROUP, e.message);
    }
  },

  /**
   * Delete all groups
   * @returns {Promise<group, APIError>}
   */
  async clear() {
    try {
      await this.deleteMany({});
    } catch (e) {
      throw new APIError(Constants.ERRORS.CLEAR_GROUPS, e.message);
    }
  },

  /**
   * List a limit of 50 groups
   * @param {number} skip - Number of groups to be skipped.
   * @param {number} limit - Limit number of groups to be returned.
   * @returns {Promise<Organisation[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .populate("experiments")
      .skip(skip)
      .limit(limit)
      .exec();
  },

  /**
   * Get group by search hash
   * @param {ObjectId} id - The objectId of search.
   * @returns {Promise<group, APIError>}
   */
  findBySearchHash(searchHash) {
    return this.findOne({ searchHash }).exec();
  }
};

/**
 * Json transformation with shared transformer
 */
GroupSchema.set("toJSON", {
  transform(doc, ret) {
    return new GroupJSONTransformer().transform(ret);
  }
});

/**
 * @typedef GroupSchema
 */
export default mongoose.model("Group", GroupSchema);
