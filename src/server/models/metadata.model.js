import mongoose from "mongoose";
import errors from "errors";
import MetadataJSONTransformer from "../transformers/MetadataJSONTransformer";

/**
 * Metadata Schema
 */
const MetadataSchema = new mongoose.Schema({
  patientId: String,
  siteId: String,
  genderAtBirth: String,
  countryOfBirth: String,
  bmi: Number,
  injectingDrugUse: String,
  homeless: String,
  imprisoned: String,
  smoker: String,
  diabetic: String,
  hivStatus: String,
  art: String,
  labId: String,
  isolateId: String,
  collectionDate: Date,
  prospectiveIsolate: Boolean,
  patientAge: Number,
  countryIsolate: String,
  cityIsolate: String,
  dateArrived: Date,
  anatomicalOrigin: String,
  smear: String,
  wgsPlatform: String,
  wgsPlatformOther: String,
  otherGenotypeInformation: Boolean,
  genexpert: String,
  hain: String,
  hainRif: String,
  hainInh: String,
  hainFl: String,
  hainAm: String,
  hainEth: String,
  phenotypeInformationFirstLineDrugs: Boolean,
  phenotypeInformationOtherDrugs: Boolean,
  susceptibility: Object,
  susceptibilityNotTestedReason: Object,
  previousTbinformation: Boolean,
  recentMdrTb: String,
  priorTreatmentDate: Date,
  tbProphylaxis: String,
  tbProphylaxisDate: Date,
  currentTbinformation: Boolean,
  startProgrammaticTreatment: Boolean,
  intensiveStartDate: Date,
  intensiveStopDate: Date,
  startProgrammaticContinuationTreatment: String,
  continuationStartDate: Date,
  continuationStopDate: Date,
  nonStandardTreatment: String,
  drugOutsidePhase: Object,
  drugOutsidePhaseStartDate: Object,
  drugOutsidePhaseEndDate: Object,
  sputumSmearConversion: String,
  sputumCultureConversion: String,
  whoOutcomeCategory: String,
  dateOfDeath: Date
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
MetadataSchema.method({});

/**
 * Statics
 */
MetadataSchema.statics = {
  /**
   * Get metadata
   * @param {ObjectId} id - The objectId of experiment.
   * @returns {Promise<Metadata, APIError>}
   */
  async get(id) {
    try {
      const metadata = await this.findById(id).exec();
      if (metadata) {
        return metadata;
      }
      throw new errors.ObjectNotFound(`Metadata not found with id ${id}`);
    } catch (e) {
      throw new errors.ObjectNotFound(e.message);
    }
  }
};

MetadataSchema.set("toJSON", {
  transform(doc, ret) {
    return new MetadataJSONTransformer(ret).transform();
  }
});

/**
 * @typedef Metadata
 */
export default mongoose.model("Metadata", MetadataSchema);
