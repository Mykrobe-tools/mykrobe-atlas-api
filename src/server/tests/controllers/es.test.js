import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import Promise from 'bluebird';
import app from '../../../index';
import User from '../../models/user.model';
import Experiment from '../../models/experiment.model';
import Organisation from '../../models/organisation.model';
import Metadata from '../../models/metadata.model';
import ESHelper from '../../helpers/ESHelper';

require('../teardown');

const users = require('../fixtures/users');

chai.config.includeStack = true;
chai.use(dirtyChai);

let token = null;

const experiments = require('../fixtures/experiments');
const metadata = require('../fixtures/metadata');

const organisationData = new Organisation(experiments.tuberculosis.organisation);
const metadataData = new Metadata(metadata.basic);
const experimentData = new Experiment(experiments.tuberculosis);

beforeEach((done) => {
  const userData = new User(users.admin);
  userData.save()
              .then(() => {
                request(app)
                  .post('/auth/login')
                  .send({ email: 'admin@nhs.co.uk', password: 'password' })
                  .end((err, res) => {
                    token = res.body.data.token;
                    done();
                  });
              });
});

afterEach((done) => {
  User.remove({}, done);
});

beforeAll((done) => {
  Promise.resolve()
    .then(ESHelper.deleteIndexIfExists)
    .then(ESHelper.createIndex)
    .then(() => {
      request(app)
        .post('/experiments/reindex')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end(() => {
          organisationData.save()
            .then((savedOrganisation) => {
              metadataData.save()
                .then((savedMetadata) => {
                  experimentData.organisation = savedOrganisation;
                  experimentData.metadata = savedMetadata;
                  experimentData.save()
                    .then(ESHelper.indexExperiment(experimentData))
                    .then(() => {
                      setTimeout(done, 1000);
                    });
                });
            });
        });
    });
});

describe('## Experiment APIs', () => {
  describe('# GET /experiments/metadata/:attribute/values', () => {
    it('should return distinct countries from ES', (done) => {
      request(app)
        .get('/experiments/metadata/countryOfBirth/values')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.equal(1);
          expect(res.body.data[0]).to.equal('Hong Kong');
          done();
        });
    });
    it('should return distinct bmi values from ES', (done) => {
      request(app)
        .get('/experiments/metadata/bmi/values')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.equal(1);
          expect(res.body.data[0]).to.equal(12);
          done();
        });
    });
    it('should return empty array if field unknown', (done) => {
      request(app)
        .get('/experiments/metadata/unknown/values')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.equal(0);
          done();
        });
    });
    it('should be a protected route', (done) => {
      request(app)
        .get('/experiments/metadata/countryOfBirth/values')
        .set('Authorization', 'Bearer INVALID_TOKEN')
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('jwt malformed');
          done();
        });
    });
  });
  describe('# GET /experiments/search', () => {
    it('should return experiment results', (done) => {
      request(app)
        .get('/experiments/search')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.results.length).to.equal(1);
          done();
        });
    });
    it('should filter by metadata fields', (done) => {
      request(app)
        .get('/experiments/search?smoker=No&imprisoned=Yes')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.results.length).to.equal(1);
          done();
        });
    });
    it('should include a summary', (done) => {
      request(app)
        .get('/experiments/search?smoker=No&imprisoned=Yes')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.summary.hits).to.equal(1);
          expect(res.body.data.results.length).to.equal(1);
          done();
        });
    });
    it('should be a protected route', (done) => {
      request(app)
        .get('/experiments/search?smoker=No&imprisoned=Yes')
        .set('Authorization', 'Bearer INVALID_TOKEN')
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('jwt malformed');
          done();
        });
    });
    it('should allow pagination', (done) => {
      request(app)
        .get('/experiments/search?smoker=No&imprisoned=Yes&per=10&page=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.summary.hits).to.equal(1);
          expect(res.body.data.results.length).to.equal(1);
          done();
        });
    });
    it('should control the page value', (done) => {
      request(app)
        .get('/experiments/search?smoker=No&imprisoned=Yes&per=10&page=0')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('"page" must be larger than or equal to 1');
          done();
        });
    });
  });
});
