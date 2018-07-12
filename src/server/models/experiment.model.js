import mongoose from "mongoose";
import errors from "errors";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import DistanceJSONTransformer from "../transformers/DistanceJSONTransformer";
import LocationJSONTransformer from "../transformers/LocationJSONTransformer";

const Mixed = mongoose.Schema.Types.Mixed;

/**
 * Distance Schema
 */
const DistanceSchema = new mongoose.Schema({
  analysed: Date,
  engine: String,
  version: String
});

/**
 * Location Schema
 */
const LocationSchema = new mongoose.Schema({
  name: String,
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  }
});

/**
 * Results
 */
const SusceptibilitySchema = new mongoose.Schema({
  name: String,
  prediction: {
    type: String,
    enum: ["R", "S"]
  },
  calledBy: Mixed
});
const PhylogeneticsSchema = new mongoose.Schema({
  type: String,
  result: String,
  percentCoverage: Number,
  medianDepth: Number
});
const ResultSchema = new mongoose.Schema({
  type: String,
  received: Date,
  susceptibility: [SusceptibilitySchema],
  phylogenetics: [PhylogeneticsSchema],
  variantCalls: Mixed,
  sequenceCalls: Mixed,
  kmer: Number,
  probeSets: [String],
  files: [String],
  version: Mixed,
  genotypeModel: String
});

/**
 * Experiment Schema
 */
const ExperimentSchema = new mongoose.Schema({
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organisation"
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  metadata: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Metadata"
  },
  location: LocationSchema,
  collected: Date,
  uploaded: Date,
  resistance: Object,
  jaccardIndex: DistanceSchema,
  snpDistance: DistanceSchema,
  geoDistance: DistanceSchema,
  file: String,
  results: [ResultSchema]
});

// Add reference to experiements
DistanceSchema.add({ experiments: [ExperimentSchema] });

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
        .populate(["organisation", "owner", "metadata"])
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
      .populate(["organisation", "owner", "metadata"])
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

DistanceSchema.set("toJSON", {
  transform(doc, ret) {
    return new DistanceJSONTransformer(ret).transform();
  }
});

LocationSchema.set("toJSON", {
  transform(doc, ret) {
    return new LocationJSONTransformer(ret).transform();
  }
});

/**
 * @typedef Experiment
 */
export default mongoose.model("Experiment", ExperimentSchema);
