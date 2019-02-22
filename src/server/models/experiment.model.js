import mongoose from "mongoose";
import errors from "errors";
import schemaValidator from "mongoose-jsonschema-validator";
import { experiment as experimentJsonSchema } from "mykrobe-atlas-jsonschema";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";

/**
 * Experiment Schema
 */
const ExperimentSchema = new mongoose.Schema(
  {
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation"
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    file: String
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
ExperimentSchema.plugin(schemaValidator, {
  jsonschema: experimentJsonSchema,
  modelName: "Experiment"
});

/**
 * Methods
 */
ExperimentSchema.method({});

/**
 * Statics
 */
ExperimentSchema.statics = {
  /**
   * Get experiment
   * @param {ObjectId} id - The objectId of experiment.
   * @returns {Promise<Experiment, APIError>}
   */
  async get(id) {
    try {
      const experiment = await this.findById(id)
        .populate(["organisation", "owner", "-results.variantCalls", "-results.sequenceCalls"])
        .exec();
      if (experiment) {
        return experiment;
      }
      throw new errors.ObjectNotFound(`Experiment not found with id ${id}`);
    } catch (e) {
      throw new errors.ObjectNotFound(e.message);
    }
  },
  /**
   * List all experiments
   * @returns {Promise<Experiment[]>}
   */
  list(limit = 0) {
    return this.find()
      .populate(["organisation", "owner"])
      .limit(limit)
      .exec();
  },

  /**
   * Find experiments by ids
   * @returns {Promise<Experiment[]>}
   */
  async findByIds(ids) {
    return this.find({ _id: { $in: ids } }).exec();
  },

  /**
   * Find experiments by isolateIds
   * @returns {Promise<Experiment[]>}
   */
  async findByIsolateIds(ids) {
    return this.find({ "metadata.sample.isolateId": { $in: ids } }).exec();
  }
};

/**
 * Json transformation with shared transformer
 */
ExperimentSchema.set("toJSON", {
  transform(doc, ret) {
    return new ExperimentJSONTransformer().transform(ret);
  }
});

/**
 * @typedef Experiment
 */
export default mongoose.model("Experiment", ExperimentSchema);
