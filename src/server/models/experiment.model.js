import mongoose from 'mongoose';
import errors from 'errors';
import ExperimentJSONTransformer from '../transformers/ExperimentJSONTransformer';
import DistanceJSONTransformer from '../transformers/DistanceJSONTransformer';
import LocationJSONTransformer from '../transformers/LocationJSONTransformer';

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
 * Experiment Schema
 */
const ExperimentSchema = new mongoose.Schema({
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Metadata'
  },
  location: LocationSchema,
  collected: Date,
  uploaded: Date,
  resistance: Object,
  jaccardIndex: DistanceSchema,
  snpDistance: DistanceSchema,
  geoDistance: DistanceSchema,
  file: String
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
ExperimentSchema.method({

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
  get(id) {
    return this.findById(id)
      .populate(['organisation', 'owner'])
      .exec()
      .then((experiment) => {
        if (experiment) {
          return experiment;
        }
        return Promise.reject(new errors.ObjectNotFound(`Experiment not found with id ${id}`));
      })
      .catch(e => Promise.reject(new errors.ObjectNotFound(e.message)));
  },
  /**
   * List a limit of 50 experiments
   * @param {number} skip - Number of experiments to be skipped.
   * @param {number} limit - Limit number of experiments to be returned.
   * @returns {Promise<Experiment[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .populate(['organisation', 'owner'])
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

/**
 * Json transformation with shared transformer
 */
ExperimentSchema.set('toJSON', {
  transform(doc, ret) {
    return new ExperimentJSONTransformer(ret).transform();
  }
});

DistanceSchema.set('toJSON', {
  transform(doc, ret) {
    return new DistanceJSONTransformer(ret).transform();
  }
});

LocationSchema.set('toJSON', {
  transform(doc, ret) {
    return new LocationJSONTransformer(ret).transform();
  }
});

/**
 * @typedef Experiment
 */
export default mongoose.model('Experiment', ExperimentSchema);
