import mongoose from "mongoose";
import TreeJSONTransformer from "../transformers/TreeJSONTransformer";
import config from "../../config/env";

/**
 * Tree Schema
 */
const TreeSchema = new mongoose.Schema({
  expires: Date,
  result: Object
});

/**
 * Methods
 */
TreeSchema.method({
  isExpired() {
    return this.expires < new Date();
  },

  async update(result, expiresIn = config.services.treeResultsMonthsToLive) {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + expiresIn);
    this.set("result", result);
    this.expires = expires;
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
