import faker from 'faker';
import _ from 'lodash';
import User from '../models/user.model';
import Organisation from '../models/organisation.model';
import Experiment from '../models/experiment.model';
import Metadata from '../models/metadata.model';

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
    .then(() => res.jsend('data cleared successfully'));
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
  for (let index =0; index < total; index += 1) { // eslint-disable-line space-infix-ops
    promises.push(saveExperiment());
  }
  Promise.all(promises)
    .then(results => res.jsend(results));
}

function saveExperiment() {
  return saveOrganisation()
    .then(savedOrganisation => saveOwner()
        .then(savedOwner => saveMetadata()
            .then((savedMetadata) => {
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
                  version: faker.fake('v{{random.number}}')
                },
                snpDistance: {
                  analysed: faker.date.past(),
                  engine: faker.lorem.word(),
                  version: faker.fake('v{{random.number}}')
                },
                geoDistance: {
                  analysed: faker.date.past(),
                  engine: faker.lorem.word(),
                  version: faker.fake('v{{random.number}}')
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
    genderAtBirth: _.sample(['male', 'female']),
    countryOfBirth: faker.address.country(),
    bmi: (Math.random() * (15)) + 15,
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
    countryIsolate: faker.random.boolean(),
    cityIsolate: faker.random.boolean(),
    dateArrived: faker.date.past(),
    anatomicalOrigin: faker.lorem.word(),
    smear: faker.lorem.word(),
    wgsPlatform: faker.lorem.word(),
    wgsPlatformOther: faker.lorem.word(),
    otherGenotypeInformation: faker.random.boolean(),
    genexpert: faker.lorem.word(),
    hain: faker.lorem.word(),
    hainRif: faker.lorem.word(),
    hainInh: faker.lorem.word(),
    hainFl: faker.lorem.word(),
    hainAm: faker.lorem.word(),
    hainEth: faker.lorem.word(),
    phenotypeInformationFirstLineDrugs: faker.random.boolean(),
    phenotypeInformationOtherDrugs: faker.random.boolean(),
    susceptibility: {},
    susceptibilityNotTestedReason: {},
    previousTbinformation: faker.random.boolean(),
    recentMdrTb: faker.lorem.word(),
    priorTreatmentDate: faker.date.past(),
    tbProphylaxis: faker.lorem.word(),
    tbProphylaxisDate: faker.date.past(),
    currentTbinformation: faker.random.boolean(),
    startProgrammaticTreatment: faker.random.boolean(),
    intensiveStartDate: faker.date.past(),
    intensiveStopDate: faker.date.past(),
    startProgrammaticContinuationTreatment: faker.lorem.word(),
    continuationStartDate: faker.date.past(),
    continuationStopDate: faker.date.past(),
    nonStandardTreatment: faker.lorem.word(),
    drugOutsidePhase: {},
    drugOutsidePhaseStartDate: {},
    drugOutsidePhaseEndDate: {},
    sputumSmearConversion: faker.lorem.word(),
    sputumCultureConversion: faker.lorem.word(),
    whoOutcomeCategory: faker.lorem.word(),
    dateOfDeath: faker.date.past()
  });
  return metadata.save();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default { clean, create };
