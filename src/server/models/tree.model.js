import mongoose from "mongoose";
import moment from "moment";
import { tree as treeJsonSchema } from "mykrobe-atlas-jsonschema";

import JSONMongooseSchema from "./jsonschema.model";

import TreeJSONTransformer from "../transformers/TreeJSONTransformer";
import config from "../../config/env";
/**
 * Tree Schema
 */
const TreeSchema = new JSONMongooseSchema(treeJsonSchema, {}, {});

/**
 * Methods
 */
TreeSchema.method({
  isExpired() {
    return moment(this.expires).isBefore(moment());
  },

  async updateAndSetExpiry(result, expiresIn = config.services.treeResultsTTL) {
    const expires = moment();
    expires.add(expiresIn, "hours");

    this.tree = result.tree;
    this.version = result.version;
    this.expires = expires.toISOString();

    return this.save();
  }
});

/**
 * Statics
 */
TreeSchema.statics = {
  /**
   * Get the tree
   * @returns {Promise<Tree, APIError>}
   */
  async get() {
    const tree = await this.findOne().exec();
    if (tree) {
      return tree;
    }
    return null;
  }
};

/**
 * Json transformation with shared transformer
 */
TreeSchema.set("toJSON", {
  transform(doc, ret) {
    return new TreeJSONTransformer().transform(ret);
  }
});

/**
 * @typedef Tree
 */
export default mongoose.model("Tree", TreeSchema);
