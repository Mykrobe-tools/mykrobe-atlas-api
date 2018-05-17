import request from 'supertest';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import { createApp } from "../setup";
import User from '../../models/user.model';
import Organisation from '../../models/organisation.model';

const app = createApp();

const users = require('../fixtures/users');

chai.config.includeStack = true;
chai.use(dirtyChai);

let savedUser = null;
let token = null;

beforeEach((done) => {
  const userData = new User(users.admin);
  userData.save()
              .then((user) => {
                savedUser = user;
                request(app)
                  .post('/auth/login')
                  .send({ email: 'admin@nhs.co.uk', password: 'password' })
                  .end((err, res) => {
                    token = res.body.data.token;
                    done();
                  });
              });
});

afterEach(async done => {
  await User.remove({});
  await Organisation.remove({});
  done();
});

describe('## User APIs', () => {
  const user = {
    firstname: 'David',
    lastname: 'Robin',
    password: 'password',
    phone: '094324783253',
    email: 'david@gmail.com'
  };

  describe('# POST /users', () => {
    it('should create a new user', (done) => {
      request(app)
        .post('/users')
        .send(user)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.firstname).to.equal(user.firstname);
          expect(res.body.data.lastname).to.equal(user.lastname);
          expect(res.body.data.phone).to.equal(user.phone);
          expect(res.body.data.email).to.equal(user.email);
          done();
        });
    });

    it('should validate user before creation - email', (done) => {
      const invalid = {
        firstname: 'David',
        lastname: 'Robin',
        password: 'password'
      };
      request(app)
        .post('/users')
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.code).to.equal(10003);
          expect(res.body.message).to.equal('"email" is required');
          done();
        });
    });

    it('should validate user before creation - password', (done) => {
      const invalid = {
        firstname: 'David',
        lastname: 'Robin',
        email: 'admin@gmail.com'
      };
      request(app)
        .post('/users')
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.code).to.equal(10003);
          expect(res.body.message).to.equal('"password" is required');
          done();
        });
    });

    it('should not save duplicate emails', (done) => {
      const invalid = {
        firstname: 'David',
        lastname: 'Robin',
        password: 'password',
        phone: '06734929442',
        email: 'admin@nhs.co.uk'
      };
      request(app)
        .post('/users')
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.code).to.equal(10005);
          expect(res.body.message).to.equal('admin@nhs.co.uk has already been registered');
          done();
        });
    });

    it('should validate user before creation - email', (done) => {
      const invalid = {
        firstname: 'David',
        lastname: 'Robin',
        phone: '094324783253',
        email: 'david',
        password: 'password'
      };
      request(app)
        .post('/users')
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.code).to.equal(10003);
          expect(res.body.message).to.equal('"email" must be a valid email');
          done();
        });
    });

    it('should generate a verificationToken', (done) => {
      request(app)
        .post('/users')
        .send(user)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.exist();

          const data = res.body.data;
          expect(data).to.have.property('id');
          const id = data.id;

          User.findById(id)
            .then((loadedUser) => {
              expect(loadedUser).to.exist();
              expect(loadedUser.verificationToken).to.exist();
              done();
            });
        });
    });
  });

  describe('# GET /users/:id', () => {
    beforeEach(async done => {
      const org = new Organisation({ name: 'Apex Entertainment', template: 'MODS' });
      const savedOrg = await org.save();
      savedUser.organisation = savedOrg;
      await savedUser.save();
      done();
    });
    it('should get user details', (done) => {
      request(app)
        .get(`/users/${savedUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.firstname).to.equal(savedUser.firstname);
          expect(res.body.data.lastname).to.equal(savedUser.lastname);
          done();
        });
    });
    it('should get user details with organisation', (done) => {
      request(app)
        .get(`/users/${savedUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.firstname).to.equal(savedUser.firstname);
          expect(res.body.data.lastname).to.equal(savedUser.lastname);
          expect(res.body.data.organisation.name).to.equal('Apex Entertainment');
          expect(res.body.data.organisation.template).to.equal('MODS');
          done();
        });
    });
    it('should report error with message - Not found, when user does not exists', (done) => {
      request(app)
        .get('/users/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.message).to.equal('User not found with id 56c787ccc67fc16ccc1a5e92');
          done();
        });
    });

    it('should remove unwanted fields', (done) => {
      request(app)
        .get(`/users/${savedUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data._id).to.be.an('undefined');
          expect(res.body.data.__v).to.be.an('undefined');
          expect(res.body.data.password).to.be.an('undefined');
          done();
        });
    });

    it('should add virtual fields', (done) => {
      request(app)
        .get(`/users/${savedUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.id).to.equal(savedUser.id);
          done();
        });
    });
  });

  describe('# GET /user', () => {
    it('should return the current user details', (done) => {
      request(app)
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.firstname).to.equal('David');
          expect(res.body.data.lastname).to.equal('Robin');
          done();
        });
    });
    it('should return an error if user not found', (done) => {
      request(app)
        .get('/user')
        .set('Authorization', 'Bearer INVLID_TOKEN')
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('jwt malformed');
          done();
        });
    });
  });

  describe('# POST /auth/login', () => {

  });

  describe('# PUT /users/:id', () => {
    it('should update user details', (done) => {
      user.firstname = 'James';
      request(app)
        .put(`/users/${savedUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.firstname).to.equal('James');
          expect(res.body.data.lastname).to.equal(user.lastname);
          done();
        });
    });
  });

  describe('# PUT /user', () => {
    it('should update the current user details', (done) => {
      user.firstname = 'James';
      request(app)
        .put('/user')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.firstname).to.equal('James');
          expect(res.body.data.lastname).to.equal('Robin');
          done();
        });
    });
    it('should return an error if the user doesnt exist', (done) => {
      user.firstname = 'James';
      request(app)
        .put('/user')
        .set('Authorization', 'Bearer INVALID_TOKEN')
        .send(user)
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('jwt malformed');
          done();
        });
    });
  });

  describe('# GET /users/', () => {
    it('should get all users', (done) => {
      request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });

  describe('# DELETE /users/:id', () => {
    it('should delete user', (done) => {
      request(app)
        .delete(`/users/${savedUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.equal('Account was successfully deleted.');
          done();
        });
    });

    it('should return an erro if user not found', (done) => {
      request(app)
        .delete('/users/589dcdd38d71fee259dc4e00')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('User not found with id 589dcdd38d71fee259dc4e00');
          done();
        });
    });
  });

  describe('# DELETE /user', () => {
    it('should delete the current user', (done) => {
      request(app)
        .delete('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.equal('Account was successfully deleted.');
          done();
        });
    });
    it('should return an error if user not authenticated', (done) => {
      request(app)
        .delete('/user')
        .set('Authorization', 'Bearer INVALID_TOKEN')
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('jwt malformed');
          done();
        });
    });
  });


  describe('# PUT /users/:id', () => {
    it('should update the user data', (done) => {
      request(app)
        .put(`/users/${savedUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '06686833972', email: 'david@nhs.co.uk' })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.phone).to.equal('06686833972');
          expect(res.body.data.email).to.equal('david@nhs.co.uk');
          done();
        });
    });
  });

  describe('# PUT /users/:id', () => {
    it('should not allow empty email', (done) => {
      request(app)
        .put(`/users/${savedUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: '', phone: '0576237437993' })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.code).to.equal(10003);
          expect(res.body.message).to.equal('"email" is not allowed to be empty');
          done();
        });
    });
    it('should keep phone value if not provided', (done) => {
      request(app)
        .put(`/users/${savedUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'david@nhs.co.uk' })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.phone).to.equal('06734929442');
          expect(res.body.data.email).to.equal('david@nhs.co.uk');
          done();
        });
    });
    it('should clear phone if empty', (done) => {
      request(app)
        .put(`/users/${savedUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '', email: 'admin@gmail.com' })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.phone).to.equal('');
          expect(res.body.data.email).to.equal('admin@gmail.com');
          done();
        });
    });
    it('should keep email value if not provided', (done) => {
      request(app)
        .put(`/users/${savedUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '06686833972' })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.phone).to.equal('06686833972');
          expect(res.body.data.email).to.equal('admin@nhs.co.uk');
          done();
        });
    });
  });

  describe('# POST /auth/forgot', () => {
  });

  describe('# POST /auth/reset', () => {
    beforeEach(async done => {
      const userData = new User(users.userWithToken);
      await userData.save();
      done();
    });

    it('should return a success response', (done) => {
      request(app)
        .post('/auth/reset')
        .send({ resetPasswordToken: '54VwcGr65AKaizXTVqLhEo6cnkln7w1o', password: 'passw0rd' })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.equal('Password was reset successfully for adam@nhs.co.uk');
          done();
        });
    });

    it('should return an error if user doesnt exist', (done) => {
      request(app)
        .post('/auth/reset')
        .send({ resetPasswordToken: 'invalidToken', password: 'passw0rd' })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.code).to.equal(10001);
          expect(res.body.message).to.equal('No registered user with token invalidToken');
          done();
        });
    });
  });

  describe('# POST /auth/verify', () => {
    it('should return a success response', (done) => {
      request(app)
        .post('/auth/verify')
        .send({ verificationToken: '107165' })
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.email).to.equal('admin@nhs.co.uk');
          done();
        });
    });
    it('should link the user to an empty organisation', (done) => {
      Organisation.remove({})
        .then(() => {
          request(app)
            .post('/auth/verify')
            .send({ verificationToken: '107165' })
            .end((err, res) => {
              expect(res.body.status).to.equal('success');
              expect(res.body.data.email).to.equal('admin@nhs.co.uk');
              expect(res.body.data.organisation).to.equal(null);
              done();
            });
        });
    });
    it('should link the user to an organisation', (done) => {
      const org = new Organisation({ name: 'Apex Entertainment', template: 'MODS' });
      org.save()
        .then(() => {
          request(app)
            .post('/auth/verify')
            .send({ verificationToken: '107165' })
            .end((err, res) => {
              expect(res.body.status).to.equal('success');
              expect(res.body.data.email).to.equal('admin@nhs.co.uk');
              expect(res.body.data.organisation.name).to.equal('Apex Entertainment');
              expect(res.body.data.organisation.template).to.equal('MODS');
              done();
            });
        });
    });
    it('should return an error if token is invalid', (done) => {
      request(app)
        .post('/auth/verify')
        .send({ verificationToken: '100200' })
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('No registered user with token 100200');
          done();
        });
    });
    it('should mark the account as valid', (done) => {
      request(app)
        .post('/auth/verify')
        .send({ verificationToken: '107165' })
        .end(() => {
          User.getByEmail('admin@nhs.co.uk')
            .then((foundUser) => {
              expect(foundUser.valid).to.equal(true);
              expect(foundUser.verificationToken).to.equal(null);
              done();
            });
        });
    });
  });

  describe('# POST /auth/resend', () => {
    it('should resend the notification', (done) => {
      request(app)
        .post('/auth/resend')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'admin@nhs.co.uk' })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.equal('Notification was resent by email');
          done();
        });
    });
    it('should require an email', (done) => {
      request(app)
        .post('/auth/resend')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('"email" is required');
          done();
        });
    });
    it('should also work for unauthenticated users', (done) => {
      request(app)
        .post('/auth/resend')
        .send({ email: 'admin@nhs.co.uk' })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.equal('Notification was resent by email');
          done();
        });
    });
  });

  describe('# POST /users/:id/role', () => {
    it('should assign the admin role to the user', (done) => {
      request(app)
        .post(`/users/${savedUser.id}/role`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.data.firstname).to.equal('David');
          expect(res.body.data.role).to.equal('Admin');
          done();
        });
    });
    it('should work only for authenticated users', (done) => {
      request(app)
        .post(`/users/${savedUser.id}/role`)
        .set('Authorization', 'Bearer INVALID_TOKEN')
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('jwt malformed');
          done();
        });
    });
    it('should work only for admin users', (done) => {
      savedUser.role = '';
      savedUser.save()
        .then((atlasUser) => {
          request(app)
            .post(`/users/${atlasUser.id}/role`)
            .set('Authorization', `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).to.equal('error');
              expect(res.body.message).to.equal('You are not allowed to perform this action.');
              done();
            });
        });
    });
    it('should return an error if the user not found', (done) => {
      request(app)
        .post('/users/56c787ccc67fc16ccc1a5e92/role')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal('error');
          expect(res.body.message).to.equal('User not found with id 56c787ccc67fc16ccc1a5e92');
          done();
        });
    });
  });
});
