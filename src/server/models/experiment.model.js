import mongoose from "mongoose";
import errors from "errors";
import schemaValidator from "mongoose-jsonschema-validator";
import experimentJsonSchema from "../../schemas/experiment";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import DistanceJSONTransformer from "../transformers/DistanceJSONTransformer";
import LocationJSONTransformer from "../transformers/LocationJSONTransformer";

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

// Add reference to experiements
// DistanceSchema.add({ experiments: [ExperimentSchema] });

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
        .populate([
          "organisation",
          "owner",
          "metadata",
          "-results.variantCalls",
          "-results.sequenceCalls"
        ])
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
  list() {
    return this.find()
      .populate(["organisation", "owner"])
      .exec();
  }
};

/**
 * Json transformation with shared transformer
 */
ExperimentSchema.set("toJSON", {
  transform(doc, ret) {
    return new ExperimentJSONTransformer(ret).transform();
  }
});

/**
 * @typedef Experiment
 */
export default mongoose.model("Experiment", ExperimentSchema);
