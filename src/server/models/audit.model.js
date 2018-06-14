import mongoose from "mongoose";

/**
 * Audit Schema
 */
const AuditSchema = new mongoose.Schema({
  sampleId: String,
  fileLocation: String,
  status: String,
  attempt: Number
});

/**
 * Methods
 */
AuditSchema.method({});

/**
 * Statics
 */
AuditSchema.statics = {};

/**
 * @typedef Organisation
 */
export default mongoose.model("Audit", AuditSchema);
