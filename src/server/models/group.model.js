import mongoose from "mongoose";
import schemaValidator from "mongoose-jsonschema-validator";
import { group as groupJsonSchema } from "mykrobe-atlas-jsonschema";
import { APIError } from "makeandship-api-common/lib/modules/error";
import Constants from "../Constants";
import JSONMongooseSchema from "./jsonschema.model";
import GroupJSONTransformer from "../transformers/GroupJSONTransformer";

/**
 * GroupSchema Schema
 */
const GroupSchema = new JSONMongooseSchema(
  groupJsonSchema,
  {
    experiments: [
      {
        type: "ObjectId",
        ref: "User"
      }
    ],
    search: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Search"
    }
  },
  {}
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

/**
 * Methods
 */
GroupSchema.method({});

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
        .populate(["experiments", "search"])
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
   * List a limit of 50 groups
   * @param {number} skip - Number of groups to be skipped.
   * @param {number} limit - Limit number of groups to be returned.
   * @returns {Promise<Organisation[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .populate(["experiments", "search"])
      .skip(skip)
      .limit(limit)
      .exec();
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
