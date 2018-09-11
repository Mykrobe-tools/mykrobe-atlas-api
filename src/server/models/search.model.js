import mongoose from "mongoose";
import errors from "errors";
import schemaValidator from "mongoose-jsonschema-validator";
import { search as searchJsonSchema } from "mykrobe-atlas-jsonschema";
import SearchJSONTransformer from "../transformers/SearchJSONTransformer";

/**
 * SearchSchema Schema
 */
const SearchSchema = new mongoose.Schema(
  {
    type: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
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

/**
 * Methods
 */
SearchSchema.method({});

/**
 * Statics
 */
SearchSchema.statics = {
  /**
   * Get user search
   * @param {ObjectId} id - The objectId of search.
   * @returns {Promise<search, APIError>}
   */
  async get(id) {
    try {
      const search = await this.findById(id)
        .populate("user")
        .exec();
      if (search) {
        return search;
      }
      throw new errors.ObjectNotFound(`Search not found with id ${id}`);
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
