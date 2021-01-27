import mongoose from "mongoose";

import { member as memberJsonSchema } from "mykrobe-atlas-jsonschema";

import JSONMongooseSchema from "./jsonschema.model";
import MemberJSONTransformer from "../transformers/MemberJSONTransformer";

/**
 * Member Schema
 */
const MemberSchema = new JSONMongooseSchema(memberJsonSchema, {}, {});

/**
 * Methods
 */
MemberSchema.method({});

/**
 * Statics
 */
MemberSchema.statics = {
  /**
   * Get member by id
   * @param {String} id - The id of member.
   * @returns {Promise<Member, APIError>}
   */
  async get(id) {
    return await this.findById(id).exec();
  },

  /**
   * Get member by userId
   * @param {String} userId - The id of user.
   * @returns {Promise<User, APIError>}
   */
  async getOrCreateMember(userId) {
    return await this.findOne({ userId }).exec();
  }
};

/**
 * Json transformation with shared transformer
 */
MemberSchema.set("toJSON", {
  transform(doc, ret) {
    return new MemberJSONTransformer().transform(ret);
  }
});

/**
 * @typedef Member
 */
export default mongoose.model("Member", MemberSchema);
