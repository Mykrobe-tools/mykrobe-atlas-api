import mongoose from "mongoose";

import { audit as auditJsonSchema } from "mykrobe-atlas-jsonschema";

import JSONMongooseSchema from "./jsonschema.model";

/**
 * Audit Schema
 */
const AuditSchema = new JSONMongooseSchema(auditJsonSchema, {}, {});

/**
 * Methods
 */
AuditSchema.method({});

/**
 * Statics
 */
AuditSchema.statics = {
  /**
   * Get audit by experimentId
   * @param {String} experimentId - The id of experiment.
   * @returns {Promise<User, APIError>}
   */
  async getByExperimentId(experimentId) {
    return await this.findOne({ experimentId }).exec();
  },

  /**
   * Get audit by taskId
   * @param {String} taskId - The id of experiment.
   * @returns {Promise<User, APIError>}
   */
  async getByTaskId(taskId) {
    return this.findOne({ taskId }).exec();
  },

  /**
   * Get audit by searchId
   * @param {String} searchId - The id of experiment.
   * @returns {Promise<User, APIError>}
   */
  async getBySearchId(searchId) {
    return this.findOne({ searchId }).exec();
  }
};

/**
 * @typedef Organisation
 */
export default mongoose.model("Audit", AuditSchema);
