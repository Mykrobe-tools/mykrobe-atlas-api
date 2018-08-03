import mongoose from "mongoose";
import errors from "errors";

/**
 * Audit Schema
 */
const AuditSchema = new mongoose.Schema({
  sampleId: String,
  fileLocation: String,
  status: String,
  taskId: String,
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
   * Get audit by sampleId
   * @param {String} sampleId - The id of experiment.
   * @returns {Promise<User, APIError>}
   */
  async getBySample(sampleId) {
    const audit = await this.findOne({ sampleId }).exec();
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
