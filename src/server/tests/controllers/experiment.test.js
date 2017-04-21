import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import app from '../../../index';
import User from '../../models/user.model';
import Experiment from '../../models/experiment.model';
import Organisation from '../../models/organisation.model';

require('../teardown');

const users = require('../fixtures/users');
const experiments = require('../fixtures/experiments');
const metadata = require('../fixtures/metadata');

chai.config.includeStack = true;
chai.use(dirtyChai);

let token = null;
let id = null;

beforeEach((done) => {
  const userData = new User(users.admin);
  const organisationData = new Organisation(experiments.tuberculosis.organisation);
  const experimentData = new Experiment(experiments.tuberculosis);
  userData.save()
              .then(() => {
                request(app)
                  .post('/auth/login')
                  .send({ email: 'admin@nhs.co.uk', password: 'password' })
                  .end((err, res) => {
                    token = res.body.data.token;
                    organisationData.save()
                      .then((savedOrganisation) => {
                        experimentData.organisation = savedOrganisation;
                        experimentData.save()
                          .then((savedExperiment) => {
                            id = savedExperiment.id;
                            done();
                          });
                      });
                  });
              });
});

afterEach((done) => {
  User.remove({})
    .then(() => {
      Organisation.remove({})
        .then(() => {
          Experiment.remove({}, done);
        });
    });
});

describe('## Experiment APIs', () => {
  describe('# POST /experiments', () => {
    it('should create a new experiment', (done) => {
      request(app)
        .post('/experiments')
        .set('Authorization', `Bearer ${token}`)
        .send(experiments.pneumonia)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.organisation.name).to.equal('Diagnostic systems');
          expect(res.body.data.location.name).to.equal('India');
          expect(res.body.data.jaccardIndex.version).to.equal('1.0');
          expect(res.body.data.snpDistance.version).to.equal('1.1');
          done();
        });
    });

    it('should set the owner to the current user', (done) => {
      request(app)
        .post('/experiments')
        .set('Authorization', `Bearer ${token}`)
        .send(experiments.pneumonia)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.owner.firstname).to.equal('David');
          expect(res.body.data.owner.lastname).to.equal('Robin');
          done();
        });
    });
  });

  describe('# GET /experiments/:id', () => {
    it('should get experiment details', (done) => {
      request(app)
        .get(`/experiments/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.organisation.name).to.equal('Apex Entertainment');
          expect(res.body.data.location.name).to.equal('London');
          done();
        });
    });

    it('should report error with message - Not found, when experiment does not exists', (done) => {
      request(app)
        .get('/experiments/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.message).to.equal('Experiment not found with id 56c787ccc67fc16ccc1a5e92');
          done();
        });
    });

    it('should remove unwanted fields', (done) => {
      request(app)
        .get(`/experiments/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data._id).to.be.an('undefined');
          expect(res.body.data.__v).to.be.an('undefined');
          done();
        });
    });

    it('should add virtual fields', (done) => {
      request(app)
        .get(`/experiments/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.id).to.equal(id);
          done();
        });
    });
  });

  describe('# PUT /experiments/:id', () => {
    it('should update experiment details', (done) => {
      const data = {
        location: {
          name: 'America',
          lat: 2.4,
          lng: 4.5
        }
      };
      request(app)
        .put(`/experiments/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.location.name).to.equal('America');
          expect(res.body.data.location.lat).to.equal(2.4);
          expect(res.body.data.location.lng).to.equal(4.5);
          expect(res.body.data.organisation.name).to.equal('Apex Entertainment');
          done();
        });
    });
  });

  describe('# GET /experiments', () => {
    it('should get all experiments', (done) => {
      request(app)
        .get('/experiments')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.equal(1);
          done();
        });
    });
  });

  describe('# DELETE /experiments/:id', () => {
    it('should delete experiment', (done) => {
      request(app)
        .delete(`/experiments/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.equal('Experiment was successfully deleted.');
          done();
        });
    });

    it('should return an error if experiment not found', (done) => {
      request(app)
        .delete('/experiments/589dcdd38d71fee259dc4e00')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('Experiment not found with id 589dcdd38d71fee259dc4e00');
          done();
        });
    });
  });
  describe('# PUT /experiments/:id/metadata', () => {
    it('should update experiment metadata', (done) => {
      request(app)
        .put(`/experiments/${id}/metadata`)
        .set('Authorization', `Bearer ${token}`)
        .send(metadata.basic)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.metadata.patientId).to.equal('12345');
          expect(res.body.data.metadata.siteId).to.equal('abc');
          expect(res.body.data.metadata.genderAtBirth).to.equal('Male');
          expect(res.body.data.metadata.countryOfBirth).to.equal('UK');
          expect(res.body.data.metadata.bmi).to.equal(12);
          expect(res.body.data.metadata.injectingDrugUse).to.equal('notice');
          expect(res.body.data.metadata.homeless).to.equal('Yes');
          expect(res.body.data.metadata.imprisoned).to.equal('Yes');
          expect(res.body.data.metadata.smoker).to.equal('No');
          expect(res.body.data.metadata.diabetic).to.equal('Yes');
          expect(res.body.data.metadata.hivStatus).to.equal('Negative');
          done();
        });
    });

    it('should return an error if experiment not found', (done) => {
      request(app)
        .put('/experiments/589dcdd38d71fee259dc4e00/metadata')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('Experiment not found with id 589dcdd38d71fee259dc4e00');
          done();
        });
    });
  });
  describe('# PUT /experiments/:id/file', () => {
    it('should upload file using resumable', (done) => {
      request(app)
        .put(`/experiments/${id}/file`)
        .set('Authorization', `Bearer ${token}`)
        .attach('files', 'src/server/tests/fixtures/files/333-08.json')
        .field('resumableChunkNumber', 1)
        .field('resumableChunkSize', 1048576)
        .field('resumableCurrentChunkSize', 251726)
        .field('resumableTotalSize', 251726)
        .field('resumableType', 'application/json')
        .field('resumableIdentifier', '251726-333-08json')
        .field('resumableFilename', '333-08.json')
        .field('resumableRelativePath', '333-08.json')
        .field('resumableTotalChunks', 1)
        .field('checksum', '4f36e4cbfc9dfc37559e13bd3a309d50')
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.complete).to.equal(true);
          expect(res.body.data.message).to.equal('Chunk 1 uploaded');
          expect(res.body.data.filename).to.equal('333-08.json');
          done();
        });
    });
    it('should return an error if experiment not found', (done) => {
      request(app)
        .put('/experiments/589dcdd38d71fee259dc4e00/file')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', 'src/server/tests/fixtures/files/333-08.json')
        .field('resumableChunkNumber', 1)
        .field('resumableChunkSize', 1048576)
        .field('resumableCurrentChunkSize', 251726)
        .field('resumableTotalSize', 251726)
        .field('resumableType', 'application/json')
        .field('resumableIdentifier', '251726-333-08json')
        .field('resumableFilename', '333-08.json')
        .field('resumableRelativePath', '333-08.json')
        .field('resumableTotalChunks', 1)
        .field('checksum', '4f36e4cbfc9dfc37559e13bd3a309d50')
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('Experiment not found with id 589dcdd38d71fee259dc4e00');
          done();
        });
    });
    it('should return an error if no file attached', (done) => {
      request(app)
        .put(`/experiments/${id}/file`)
        .set('Authorization', `Bearer ${token}`)
        .field('resumableChunkNumber', 1)
        .field('resumableChunkSize', 1048576)
        .field('resumableCurrentChunkSize', 251726)
        .field('resumableTotalSize', 251726)
        .field('resumableType', 'application/json')
        .field('resumableIdentifier', '251726-333-08json')
        .field('resumableFilename', '333-08.json')
        .field('resumableRelativePath', '333-08.json')
        .field('resumableTotalChunks', 1)
        .field('checksum', '4f36e4cbfc9dfc37559e13bd3a309d50')
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('No files found to upload');
          done();
        });
    });
    it('should return an error if checksum is not valid', (done) => {
      request(app)
        .put(`/experiments/${id}/file`)
        .set('Authorization', `Bearer ${token}`)
        .attach('files', 'src/server/tests/fixtures/files/333-08.json')
        .field('resumableChunkNumber', 1)
        .field('resumableChunkSize', 1048576)
        .field('resumableCurrentChunkSize', 251726)
        .field('resumableTotalSize', 251726)
        .field('resumableType', 'application/json')
        .field('resumableIdentifier', '251726-333-08json')
        .field('resumableFilename', '333-08.json')
        .field('resumableRelativePath', '333-08.json')
        .field('resumableTotalChunks', 1)
        .field('checksum', '4f36e4cbfc9dfc37559e13bd3a309d55')
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.data.complete).to.equal(false);
          expect(res.body.data.message).to.equal("Uploaded file checksum doesn't match original checksum");
          done();
        });
    });
    it('should return an error if chunk size is not correct', (done) => {
      request(app)
        .put(`/experiments/${id}/file`)
        .set('Authorization', `Bearer ${token}`)
        .attach('files', 'src/server/tests/fixtures/files/333-08.json')
        .field('resumableChunkNumber', 1)
        .field('resumableChunkSize', 1048576)
        .field('resumableCurrentChunkSize', 251726)
        .field('resumableTotalSize', 251700)
        .field('resumableType', 'application/json')
        .field('resumableIdentifier', '251726-333-08json')
        .field('resumableFilename', '333-08.json')
        .field('resumableRelativePath', '333-08.json')
        .field('resumableTotalChunks', 1)
        .field('checksum', '4f36e4cbfc9dfc37559e13bd3a309d50')
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.data.complete).to.equal(false);
          expect(res.body.data.message).to.equal('Incorrect individual chunk size');
          done();
        });
    });
    describe('when provider and path are present', () => {
      it('should only allow valid providers', (done) => {
        request(app)
          .put(`/experiments/${id}/file`)
          .set('Authorization', `Bearer ${token}`)
          .send({ provider: 'ftp', path: '/tmp/file.json' })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('"provider" must be one of [dropbox, box, googleDrive, oneDrive]');
            done();
          });
      });
      it('should push message to dropbox queue', (done) => {
        request(app)
          .put(`/experiments/${id}/file`)
          .set('Authorization', `Bearer ${token}`)
          .send({ provider: 'dropbox', path: '/tmp/file.json' })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.data).to.equal('Download triggered from dropbox');
            done();
          });
      });
    });
  });
  describe('# GET /experiments/:id/file', () => {
    it('should return an error if no file found', (done) => {
      request(app)
        .get(`/experiments/${id}/file`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.data).to.equal('No file found for this Experiment');
          done();
        });
    });
    it('should be a protected route', (done) => {
      request(app)
        .get(`/experiments/${id}/file`)
        .set('Authorization', 'Bearer INVALID_TOKEN')
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('jwt malformed');
          done();
        });
    });
  });
});
