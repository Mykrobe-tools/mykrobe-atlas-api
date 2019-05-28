import mongoose from "mongoose";
import errors from "errors";
import schemaValidator from "mongoose-jsonschema-validator";
import { experiment as experimentJsonSchema } from "mykrobe-atlas-jsonschema";

import JSONMongooseSchema from "./jsonschema.model";

import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import ExperimentHelper from "../helpers/ExperimentHelper";

/**
 * Experiment Schema
 */
const ExperimentSchema = new JSONMongooseSchema(
  experimentJsonSchema,
  {
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation"
    },
    owner: {
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
ExperimentSchema.plugin(schemaValidator, {
  jsonschema: experimentJsonSchema,
  modelName: "Experiment"
});

/**
 * Methods
 */
ExperimentSchema.method({});

// geocode when isolate country changes
ExperimentSchema.pre("save", async function() {
  if (
    this.isModified("metadata.sample.countryIsolate") ||
    this.isModified("metadata.sample.cityIsolate")
  ) {
    await ExperimentHelper.enhanceWithGeocode(this);
  }
});

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
   * List all experiments since an object id
   * @returns {Promise<Experiment[]>}
   */
  since(id = null, limit = 0) {
    if (id) {
      // start from the last id - ids maintain a natural order
      return this.find({ _id: { $gt: id } })
        .populate(["organisation", "owner"])
        .sort({ _id: "asc" })
        .limit(limit)
        .exec();
    } else {
      // start from the beginning
      return this.find({})
        .populate(["organisation", "owner"])
        .sort({ _id: "asc" })
        .limit(limit)
        .exec();
    }
  },
  /**
   * Find experiments by ids
   * @returns {Promise<Experiment[]>}
   */
  async findByIds(ids) {
    const validIds = ids
      ? ids.filter(id => {
          return mongoose.Types.ObjectId.isValid(id);
        })
      : [];
    return this.find({ _id: { $in: validIds } }).exec();
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
