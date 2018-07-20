import mongoose from "mongoose";
import errors from "errors";
import OrganisationJSONTransformer from "../transformers/OrganisationJSONTransformer";

/**
 * Organisation Schema
 */
const OrganisationSchema = new mongoose.Schema({
  name: String,
  template: String
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 * - plugins
 */

/**
 * Methods
 */
OrganisationSchema.method({});

/**
 * Statics
 */
OrganisationSchema.statics = {
  /**
   * Get organisation
   * @param {ObjectId} id - The objectId of experiment.
   * @returns {Promise<Organisation, APIError>}
   */
  async get(id) {
    try {
      const organisation = await this.findById(id).exec();
      if (organisation) {
        return organisation;
      }
      throw new errors.ObjectNotFound(`Organisation not found with id ${id}`);
    } catch (e) {
      throw new errors.ObjectNotFound(e.message);
    }
  },

  /**
   * Finds and updates the organisation
   * @returns {Promise<Organisation, APIError>}
   */
  async findOrganisationAndUpdate(query, newData) {
    const organisation = await this.findOneAndUpdate(query, newData, {
      new: true,
      upsert: true
    }).exec();
    return organisation;
  },

  /**
   * List a limit of 50 organisations
   * @param {number} skip - Number of organisations to be skipped.
   * @param {number} limit - Limit number of organisations to be returned.
   * @returns {Promise<Organisation[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

OrganisationSchema.set("toJSON", {
  transform(doc, ret) {
    return new OrganisationJSONTransformer().transform(ret);
  }
});

/**
 * @typedef Organisation
 */
export default mongoose.model("Organisation", OrganisationSchema);
