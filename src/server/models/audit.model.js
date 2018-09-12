import mongoose from "mongoose";
import errors from "errors";

/**
 * Audit Schema
 */
const AuditSchema = new mongoose.Schema({
  taskId: String,
  experimentId: String,
  searchId: String,
  userId: String,
  requestMethod: String,
  requestUri: String,
  fileLocation: String,
  status: String,
  type: String,
  attempt: Number
});

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
    const audit = await this.findOne({ experimentId }).exec();
    if (audit) {
      return audit;
    }
    throw new errors.ObjectNotFound();
  },

  /**
   * Get audit by userId
   * @param {String} userId - The id of experiment.
   * @returns {Promise<User, APIError>}
   */
  async getByUserId(userId) {
    const audit = await this.findOne({ userId }).exec();
    if (audit) {
      return audit;
    }
    throw new errors.ObjectNotFound();
  },

  /**
   * Get audit by searchId
   * @param {String} searchId - The id of experiment.
   * @returns {Promise<User, APIError>}
   */
  async getBySearchId(searchId) {
    const audit = await this.findOne({ searchId }).exec();
    if (audit) {
      return audit;
    }
    throw new errors.ObjectNotFound();
  }
};

/**
 * @typedef Organisation
 */
export default mongoose.model("Audit", AuditSchema);
