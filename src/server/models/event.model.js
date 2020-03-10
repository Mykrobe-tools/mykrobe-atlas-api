import mongoose from "mongoose";

import { event as eventJsonSchema } from "mykrobe-atlas-jsonschema";

import JSONMongooseSchema from "./jsonschema.model";
import EventJSONTransformer from "../transformers/EventJSONTransformer";

/**
 * Event Schema
 */
const EventSchema = new JSONMongooseSchema(eventJsonSchema, {}, {});

/**
 * Methods
 */
EventSchema.method({});

/**
 * Statics
 */
EventSchema.statics = {
  /**
   * Get event by userId
   * @param {String} userId - The id of user.
   * @returns {Promise<User, APIError>}
   */
  async getByUserId(userId) {
    return await this.findOne({ userId }).exec();
  },

  /**
   * List all events
   * @returns {Promise<EventInit[]>}
   */
  list(limit = 0) {
    return this.find()
      .limit(limit)
      .exec();
  }
};

/**
 * Json transformation with shared transformer
 */
EventSchema.set("toJSON", {
  transform(doc, ret) {
    return new EventJSONTransformer().transform(ret);
  }
});

/**
 * @typedef Event
 */
export default mongoose.model("Event", EventSchema);
