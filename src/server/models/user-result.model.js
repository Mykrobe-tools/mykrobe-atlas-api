import mongoose from "mongoose";
import errors from "errors";
import schemaValidator from "mongoose-jsonschema-validator";
import { userResult as userResultJsonSchema } from "mykrobe-atlas-jsonschema";
import UserResultJSONTransformer from "../transformers/UserResultJSONTransformer";

/**
 * UserResult Schema
 */
const UserResultSchema = new mongoose.Schema(
  {
    resultId: String,
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
UserResultSchema.plugin(schemaValidator, {
  jsonschema: userResultJsonSchema,
  modelName: "UserResult"
});

/**
 * Methods
 */
UserResultSchema.method({});

/**
 * Statics
 */
UserResultSchema.statics = {
  /**
   * Get user userResult
   * @param {ObjectId} id - The objectId of userResult.
   * @returns {Promise<userResult, APIError>}
   */
  async get(id) {
    try {
      const userResult = await this.findById(id)
        .populate("user")
        .exec();
      if (userResult) {
        return userResult;
      }
      throw new errors.ObjectNotFound(`UserResult not found with id ${id}`);
    } catch (e) {
      throw new errors.ObjectNotFound(e.message);
    }
  }
};

/**
 * Json transformation with shared transformer
 */
UserResultSchema.set("toJSON", {
  transform(doc, ret) {
    return new UserResultJSONTransformer().transform(ret);
  }
});

/**
 * @typedef UserResult
 */
export default mongoose.model("UserResult", UserResultSchema);
