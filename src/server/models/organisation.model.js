import mongoose from 'mongoose';
import errors from 'errors';
import OrganisationJSONTransformer from '../transformers/OrganisationJSONTransformer';

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
OrganisationSchema.method({

});

/**
 * Statics
 */
OrganisationSchema.statics = {
  /**
   * Get organisation
   * @param {ObjectId} id - The objectId of experiment.
   * @returns {Promise<Organisation, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((organisation) => {
        if (organisation) {
          return organisation;
        }
        return Promise.reject(new errors.ObjectNotFound(`Organisation not found with id ${id}`));
      })
      .catch(e => Promise.reject(new errors.ObjectNotFound(e.message)));
  },

  /**
   * Finds and updates the organisation
   * @returns {Promise<Organisation, APIError>}
   */
  findOrganisationAndUpdate(query, newData) {
    return this.findOneAndUpdate(query, newData, { new: true, upsert: true })
      .exec()
      .then(organisation => organisation);
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

OrganisationSchema.set('toJSON', {
  transform(doc, ret) {
    return new OrganisationJSONTransformer(ret).transform();
  }
});

/**
 * @typedef Organisation
 */
export default mongoose.model('Organisation', OrganisationSchema);
