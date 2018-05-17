import faker from "faker";
import _ from "lodash";
import User from "../models/user.model";
import Organisation from "../models/organisation.model";
import Experiment from "../models/experiment.model";
import Metadata from "../models/metadata.model";

/**
 * Clears the data in the db
 * @param req
 * @param res
 * @returns {*}
 */
function clean(req, res) {
  User.remove({})
    .then(() => Experiment.remove({}))
    .then(() => Organisation.remove({}))
    .then(() => Metadata.remove({}))
    .then(() => res.jsend("data cleared successfully"));
}

/**
 * Creates the data in the db
 * @param req
 * @param res
 * @returns {*}
 */
function create(req, res) {
  const total = req.body.total || 50;
  const promises = [];
  for (let index = 0; index < total; index += 1) {
    // eslint-disable-line space-infix-ops
    promises.push(saveExperiment());
  }
  Promise.all(promises).then(results => res.jsend(results));
}

function saveExperiment() {
  return saveOrganisation().then(savedOrganisation =>
    saveOwner().then(savedOwner =>
      saveMetadata().then(savedMetadata => {
        const experiment = new Experiment({
          organisation: savedOrganisation,
          owner: savedOwner,
          metadata: savedMetadata,
          location: {
            name: faker.address.city(),
            lat: faker.address.latitude(),
            lng: faker.address.longitude()
          },
          collected: faker.date.past(),
          uploaded: faker.date.past(),
          resistance: {},
          jaccardIndex: {
            analysed: faker.date.past(),
            engine: faker.lorem.word(),
            version: faker.fake("v{{random.number}}")
          },
          snpDistance: {
            analysed: faker.date.past(),
            engine: faker.lorem.word(),
            version: faker.fake("v{{random.number}}")
          },
          geoDistance: {
            analysed: faker.date.past(),
            engine: faker.lorem.word(),
            version: faker.fake("v{{random.number}}")
          },
          file: faker.system.fileName()
        });
        return experiment.save();
      })
    )
  );
}

function saveOrganisation() {
  const organisation = new Organisation({
    name: faker.company.companyName()
  });
  return organisation.save();
}

function saveOwner() {
  const owner = new User({
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    phone: faker.phone.phoneNumber(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    valid: true
  });
  return owner.save();
}

function saveMetadata() {
  const metadata = new Metadata({
    patientId: faker.random.uuid(),
    siteId: faker.random.uuid(),
    genderAtBirth: _.sample(["male", "female"]),
    countryOfBirth: faker.address.country(),
    bmi: Math.random() * 15 + 15,
    injectingDrugUse: faker.random.boolean(),
    homeless: faker.random.boolean(),
    imprisoned: faker.random.boolean(),
    smoker: faker.random.boolean(),
    diabetic: faker.random.boolean(),
    hivStatus: faker.random.boolean(),
    art: faker.random.boolean(),
    labId: faker.random.uuid(),
    isolateId: faker.random.uuid(),
    collectionDate: faker.date.past(),
    prospectiveIsolate: faker.random.boolean(),
    patientAge: getRandomInt(8, 80),
    countryIsolate: faker.address.country(),
    cityIsolate: faker.address.city(),
    dateArrived: faker.date.past(),
    anatomicalOrigin: _.sample([
      "respiratory",
      "Lymph node",
      "CSF",
      "Gastric",
      "Bone",
      "Other known site",
      "Non-respiratory, site not known",
      "Not known"
    ]),
    smear: _.sample(["Negative", "+", "++", "+++", "Not known"]),
    wgsPlatform: _.sample(["HiSeq", "MiSeq", "NextSeq", "Other"]),
    wgsPlatformOther: faker.lorem.word(),
    otherGenotypeInformation: faker.random.boolean(),
    genexpert: _.sample([
      "RIF sensitive",
      "RIF resistant",
      "Inconclusive",
      "Not tested"
    ]),
    hain: _.sample([
      "Not tested",
      "INH/RIF test",
      "Fluoroquinolone / aminoglycoside / ethambutol test",
      "Both"
    ]),
    hainRif: _.sample([
      "RIF sensitive",
      "RIF resistant",
      "RIF inconclusive",
      "RIF test failed"
    ]),
    hainInh: _.sample([
      "INH sensitive ",
      "INH resistant",
      "INH inconclusive",
      "INH test failed"
    ]),
    hainFl: _.sample([
      "FL sensitive ",
      "FL resistant",
      "FL inconclusive",
      "FL test failed"
    ]),
    hainAm: _.sample([
      "AM sensitive ",
      "AM resistant",
      "AM inconclusive",
      "AM test failed"
    ]),
    hainEth: _.sample([
      "ETH sensitive ",
      "ETH resistant",
      "ETH inconclusive",
      "ETH test failed"
    ]),
    phenotypeInformationFirstLineDrugs: faker.random.boolean(),
    phenotypeInformationOtherDrugs: faker.random.boolean(),
    susceptibility: {},
    susceptibilityNotTestedReason: {},
    previousTbinformation: faker.random.boolean(),
    recentMdrTb: _.sample(["Yes", "No", "Not known"]),
    priorTreatmentDate: faker.date.past(),
    tbProphylaxis: _.sample(["Yes", "No", "Not known"]),
    tbProphylaxisDate: faker.date.past(),
    currentTbinformation: faker.random.boolean(),
    startProgrammaticTreatment: faker.random.boolean(),
    intensiveStartDate: faker.date.past(),
    intensiveStopDate: faker.date.past(),
    startProgrammaticContinuationTreatment: _.sample([
      "Yes",
      "No",
      "Not known"
    ]),
    continuationStartDate: faker.date.past(),
    continuationStopDate: faker.date.past(),
    nonStandardTreatment: _.sample(["Yes", "No", "Not known"]),
    drugOutsidePhase: {},
    drugOutsidePhaseStartDate: {},
    drugOutsidePhaseEndDate: {},
    sputumSmearConversion: _.sample([
      "Sputum smear negative at 2-3 months",
      "Sputum smear positive at 2-3 months",
      "Not known or not done"
    ]),
    sputumCultureConversion: _.sample([
      "Sputum culture negative at 2-3 months",
      "Sputum culture positive at 2-3 months",
      "Not known or not done"
    ]),
    whoOutcomeCategory: _.sample([
      "Cured",
      "Treatment completed",
      "Treatment failed",
      "Died",
      "Lost to follow-up or defaulted",
      "Not evaluated",
      "Treatment success",
      "Not known"
    ]),
    dateOfDeath: faker.date.past()
  });
  return metadata.save();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default { clean, create };
