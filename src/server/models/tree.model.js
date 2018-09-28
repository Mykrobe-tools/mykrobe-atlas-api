import mongoose from "mongoose";
import TreeJSONTransformer from "../transformers/TreeJSONTransformer";
import config from "../../config/env";

/**
 * Tree Schema
 */
const TreeSchema = new mongoose.Schema({
  tree: String,
  type: {
    type: String,
    default: "newick"
  },
  version: String,
  expires: Date
});

/**
 * Methods
 */
TreeSchema.method({
  isExpired() {
    return this.expires < new Date();
  },

  async update(result, expiresIn = config.services.treeResultsTTL) {
    const expires = new Date();
    expires.setHours(expires.getHours() + expiresIn);
    this.tree = result.tree;
    this.version = result.version;
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
