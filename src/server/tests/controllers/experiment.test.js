import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import app from '../../../index';
import User from '../../models/user.model';
import Experiment from '../../models/experiment.model';

require('../teardown');

const users = require('../fixtures/users');
const experiments = require('../fixtures/experiments');

chai.config.includeStack = true;
chai.use(dirtyChai);

let token = null;
let id = null;

beforeEach((done) => {
  const userData = new User(users.admin);
  const experimentData = new Experiment(experiments.tuberculosis);
  userData.save()
              .then(() => {
                request(app)
                  .post('/auth/login')
                  .send({ email: 'admin@nhs.co.uk', password: 'password' })
                  .end((err, res) => {
                    token = res.body.data.token;
                    experimentData.save()
                      .then((savedExperiment) => {
                        id = savedExperiment.id;
                        done();
                      });
                  });
              });
});

afterEach((done) => {
  User.remove({})
    .then(() => {
      Experiment.remove({}, done);
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
});
