import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import Metadata from '../../models/metadata.model';

require("../setup");
const metadata = require('../fixtures/metadata');

chai.config.includeStack = true;
chai.use(dirtyChai);
let id = null;

beforeEach((done) => {
  const metadataData = new Metadata(metadata.basic);
  metadataData.save()
    .then((savedMetadata) => {
      id = savedMetadata.id;
      done();
    });
});

afterEach((done) => {
  Metadata.remove({}, done);
});

describe('## Metadata Functions', () => {
  it('should save a new metadata', (done) => {
    const metadataData = new Metadata(metadata.basic);
    metadataData.save()
      .then((savedMetadata) => {
        expect(savedMetadata.patientId).to.equal('12345');
        expect(savedMetadata.siteId).to.equal('abc');
        expect(savedMetadata.genderAtBirth).to.equal('Male');
        expect(savedMetadata.countryOfBirth).to.equal('Hong Kong');
        expect(savedMetadata.bmi).to.equal(12);
        expect(savedMetadata.injectingDrugUse).to.equal('notice');
        expect(savedMetadata.homeless).to.equal('Yes');
        expect(savedMetadata.imprisoned).to.equal('Yes');
        expect(savedMetadata.smoker).to.equal('No');
        expect(savedMetadata.diabetic).to.equal('Yes');
        expect(savedMetadata.hivStatus).to.equal('Negative');
        done();
      });
  });
  it('should fetch the metadata by id', (done) => {
    Metadata.get(id)
      .then((foundMetadata) => {
        expect(foundMetadata.patientId).to.equal('12345');
        expect(foundMetadata.siteId).to.equal('abc');
        expect(foundMetadata.genderAtBirth).to.equal('Male');
        expect(foundMetadata.countryOfBirth).to.equal('Hong Kong');
        expect(foundMetadata.bmi).to.equal(12);
        expect(foundMetadata.injectingDrugUse).to.equal('notice');
        expect(foundMetadata.homeless).to.equal('Yes');
        expect(foundMetadata.imprisoned).to.equal('Yes');
        expect(foundMetadata.smoker).to.equal('No');
        expect(foundMetadata.diabetic).to.equal('Yes');
        expect(foundMetadata.hivStatus).to.equal('Negative');
        done();
      });
  });
  it('should return an error if not found', (done) => {
    Metadata.get('58d3f3795d34d121805fdc61')
      .catch((e) => {
        expect(e.name).to.equal('ObjectNotFound');
        expect(e.message).to.equal('Metadata not found with id 58d3f3795d34d121805fdc61');
        done();
      });
  });
  it('should transform experiment it to json', (done) => {
    Metadata.get(id)
      .then((foundMetadata) => {
        const json = foundMetadata.toJSON();
        expect(json.patientId).to.equal('12345');
        expect(json.siteId).to.equal('abc');
        expect(json.genderAtBirth).to.equal('Male');
        expect(json.countryOfBirth).to.equal('Hong Kong');
        expect(json.bmi).to.equal(12);
        expect(json.injectingDrugUse).to.equal('notice');
        expect(json.homeless).to.equal('Yes');
        expect(json.imprisoned).to.equal('Yes');
        expect(json.smoker).to.equal('No');
        expect(json.diabetic).to.equal('Yes');
        expect(json.hivStatus).to.equal('Negative');
        done();
      });
  });
});
