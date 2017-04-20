import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import Organisation from '../../models/organisation.model';

require('../../../index');
const experiments = require('../fixtures/experiments');

chai.config.includeStack = true;
chai.use(dirtyChai);
let id = null;

beforeEach((done) => {
  const organisationData = new Organisation(experiments.tuberculosis.organisation);
  organisationData.save()
    .then((savedOrganisation) => {
      id = savedOrganisation.id;
      done();
    });
});

afterEach((done) => {
  Organisation.remove({}, done);
});

describe('## Organisations Functions', () => {
  it('should save a new organisation', (done) => {
    const organisationData = new Organisation(experiments.pneumonia.organisation);
    organisationData.save()
      .then((savedOrganisation) => {
        expect(savedOrganisation.name).to.equal('Diagnostic systems');
        done();
      });
  });
  it('should fetch the organisation by id', (done) => {
    Organisation.get(id)
      .then((foundOrganisation) => {
        expect(foundOrganisation.name).to.equal('Apex Entertainment');
        done();
      });
  });
  it('should return an error if not found', (done) => {
    Organisation.get('58d3f3795d34d121805fdc61')
      .catch((e) => {
        expect(e.name).to.equal('ObjectNotFound');
        expect(e.message).to.equal('Organisation not found with id 58d3f3795d34d121805fdc61');
        done();
      });
  });
  it('should transform organisation to json', (done) => {
    Organisation.get(id)
      .then((foundOrganisation) => {
        const json = foundOrganisation.toJSON();
        expect(json.name).to.equal('Apex Entertainment');
        done();
      });
  });
  it('should list all organisations', (done) => {
    Organisation.list()
      .then((organisations) => {
        expect(organisations.length).to.equal(1);
        expect(organisations[0].name).to.equal('Apex Entertainment');
        done();
      });
  });
});
