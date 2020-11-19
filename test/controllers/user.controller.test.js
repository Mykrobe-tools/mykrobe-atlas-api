import request from "supertest";
import httpStatus from "http-status";

import { createApp } from "../setup";

import Audit from "../../src/server/models/audit.model";
import User from "../../src/server/models/user.model";
import Organisation from "../../src/server/models/organisation.model";
import Search from "../../src/server/models/search.model";
import Experiment from "../../src/server/models/experiment.model";
import Event from "../../src/server/models/event.model";

import Constants from "../../src/server/Constants";

import users from "../fixtures/users";
import searches from "../fixtures/searches";
import experiments from "../fixtures/experiments";
import MDR from "../fixtures/files/MDR_Results.json";

const args = {
  app: null,
  user: null,
  token: null,
  experimentId: null
};

beforeAll(async () => {
  args.app = await createApp();
});

beforeEach(async done => {
  const userData = new User(users.admin);
  const experimentData = new Experiment(experiments.tbUploadMetadata);

  args.user = await userData.save();
  request(args.app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end(async (err, res) => {
      args.token = res.body.data.access_token;

      experimentData.owner = args.user;
      const savedExperiment = await experimentData.save();

      args.experimentId = savedExperiment.id;
      done();
    });
});

afterEach(async done => {
  await User.deleteMany({});
  await Experiment.deleteMany({});
  await Organisation.deleteMany({});
  await Event.deleteMany({});
  done();
});

describe("UserController", () => {
  const user = {
    firstname: "David",
    lastname: "Robin",
    password: "password",
    phone: "094324783253",
    username: "david@gmail.com"
  };

  describe("# POST /users", () => {
    it("should create a new user", done => {
      request(args.app)
        .post("/users")
        .send(user)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual(user.firstname);
          expect(res.body.data.lastname).toEqual(user.lastname);
          expect(res.body.data.phone).toEqual(user.phone);
          expect(res.body.data.email).toEqual(user.username);
          done();
        });
    });

    it("should validate user before creation - username", done => {
      const invalid = {
        firstname: "David",
        lastname: "Robin",
        password: "password"
      };
      request(args.app)
        .post("/users")
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(Constants.ERRORS.VALIDATION_ERROR);
          expect(res.body.message).toEqual("Unable to create user");
          expect(res.body.data.errors.username.message).toEqual(
            "should have required property 'username'"
          );
          done();
        });
    });

    it("should validate user before creation - password", done => {
      const invalid = {
        firstname: "David",
        lastname: "Robin",
        username: "admin@gmail.com"
      };
      request(args.app)
        .post("/users")
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(Constants.ERRORS.CREATE_USER);
          expect(res.body.message).toEqual("Please provide a password");
          done();
        });
    });

    it("should not save duplicate emails", done => {
      const invalid = {
        firstname: "David",
        lastname: "Robin",
        password: "password",
        phone: "06734929442",
        username: "admin@nhs.co.uk"
      };
      request(args.app)
        .post("/users")
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(Constants.ERRORS.CREATE_USER);
          expect(res.body.message).toEqual(
            "User validation failed: username: admin@nhs.co.uk has already been registered"
          );
          done();
        });
    });

    it("should validate user before creation - email", done => {
      const invalid = {
        firstname: "David",
        lastname: "Robin",
        phone: "094324783253",
        username: "david",
        password: "password"
      };
      request(args.app)
        .post("/users")
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(Constants.ERRORS.CREATE_USER);
          expect(res.body.message).toEqual("Invalid username");
          expect(res.body.data).toHaveProperty("errors");
          expect(res.body.data.errors).toHaveProperty("username");
          done();
        });
    });

    it("should save a valid keycloak id", done => {
      request(args.app)
        .post("/users")
        .send(user)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual(user.firstname);
          expect(res.body.data.lastname).toEqual(user.lastname);
          expect(res.body.data.phone).toEqual(user.phone);
          expect(res.body.data.email).toEqual(user.username);
          expect(res.body.data.keycloakId).toBeTruthy();
          done();
        });
    });
  });

  describe("# GET /users/:id", () => {
    beforeEach(async done => {
      const org = new Organisation({
        name: "Apex Entertainment"
      });
      const savedOrg = await org.save();
      args.user.organisation = savedOrg;
      await args.user.save();
      done();
    });
    it("should get user details", done => {
      request(args.app)
        .get(`/users/${args.user.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual(args.user.firstname);
          expect(res.body.data.lastname).toEqual(args.user.lastname);
          done();
        });
    });
    it("should get user details with organisation", done => {
      request(args.app)
        .get(`/users/${args.user.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual(args.user.firstname);
          expect(res.body.data.lastname).toEqual(args.user.lastname);
          expect(res.body.data.organisation.name).toEqual("Apex Entertainment");
          expect(res.body.data.organisation.slug).toEqual("apex-entertainment");
          done();
        });
    });
    it("should report error with message - Not found, when user does not exists", done => {
      request(args.app)
        .get("/users/56c787ccc67fc16ccc1a5e92")
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.message).toEqual("User not found with id 56c787ccc67fc16ccc1a5e92");
          done();
        });
    });

    it("should remove unwanted fields", done => {
      request(args.app)
        .get(`/users/${args.user.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data._id).toBeUndefined();
          expect(res.body.data.__v).toBeUndefined();
          expect(res.body.data.password).toBeUndefined();
          done();
        });
    });

    it("should add virtual fields", done => {
      request(args.app)
        .get(`/users/${args.user.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.id).toEqual(args.user.id);
          done();
        });
    });
  });

  describe("# GET /user", () => {
    it("should return the current user details", done => {
      request(args.app)
        .get("/user")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual("David");
          expect(res.body.data.lastname).toEqual("Robin");
          done();
        });
    });
    it("should return an error if user not found", done => {
      request(args.app)
        .get("/user")
        .set("Authorization", "Bearer INVLID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
  });

  describe("# POST /auth/login", () => {});

  describe("# PUT /users/:id", () => {
    it("should update user details", done => {
      user.firstname = "James";
      request(args.app)
        .put(`/users/${args.user.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .send(user)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.firstname).toEqual("James");
          expect(res.body.data.lastname).toEqual(user.lastname);
          done();
        });
    });
  });

  describe("# PUT /user", () => {
    it("should update the current user details", done => {
      user.firstname = "James";
      request(args.app)
        .put("/user")
        .set("Authorization", `Bearer ${args.token}`)
        .send(user)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.firstname).toEqual("James");
          expect(res.body.data.lastname).toEqual("Robin");
          done();
        });
    });
    it("should return an error if the user doesnt exist", done => {
      user.firstname = "James";
      request(args.app)
        .put("/user")
        .set("Authorization", "Bearer INVALID_TOKEN")
        .send(user)
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
  });

  describe("# GET /users/", () => {
    it("should get all users", done => {
      request(args.app)
        .get("/users")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          done();
        });
    });
  });

  describe("# DELETE /users/:id", () => {
    it("should delete user", done => {
      request(args.app)
        .delete(`/users/${args.user.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Account was successfully deleted.");
          done();
        });
    });

    it("should return an error if user not found", done => {
      request(args.app)
        .delete("/users/589dcdd38d71fee259dc4e00")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("User not found with id 589dcdd38d71fee259dc4e00");
          done();
        });
    });
  });

  describe("# DELETE /user", () => {
    it("should delete the current user", done => {
      request(args.app)
        .delete("/user")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Account was successfully deleted.");
          done();
        });
    });
    it("should return an error if user not authenticated", done => {
      request(args.app)
        .delete("/user")
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
  });

  describe("# PUT /users/:id", () => {
    it("should update the user data", done => {
      request(args.app)
        .put(`/users/${args.user.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .send({ phone: "06686833972", email: "david@nhs.co.uk" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.phone).toEqual("06686833972");
          expect(res.body.data.email).toEqual("david@nhs.co.uk");
          done();
        });
    });
  });

  describe("# PUT /users/:id", () => {
    it("should not allow empty email", done => {
      request(args.app)
        .put(`/users/${args.user.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .send({ email: "", phone: "0576237437993" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(Constants.ERRORS.UPDATE_USER);
          expect(res.body.message).toEqual("User validation failed");
          done();
        });
    });
    it("should keep phone value if not provided", done => {
      request(args.app)
        .put(`/users/${args.user.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .send({ email: "david@nhs.co.uk" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.phone).toEqual("06734929442");
          expect(res.body.data.email).toEqual("david@nhs.co.uk");
          done();
        });
    });
    it("should clear phone if empty", done => {
      request(args.app)
        .put(`/users/${args.user.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .send({ phone: "", email: "admin@gmail.com" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.phone).toEqual("");
          expect(res.body.data.email).toEqual("admin@gmail.com");
          done();
        });
    });
    it("should keep email value if not provided", done => {
      request(args.app)
        .put(`/users/${args.user.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .send({ phone: "06686833972" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.phone).toEqual("06686833972");
          expect(res.body.data.email).toEqual("admin@nhs.co.uk");
          done();
        });
    });
  });

  describe("# POST /auth/forgot", () => {
    it("should return a success response", done => {
      request(args.app)
        .post("/auth/forgot")
        .send({
          email: "admin@nhs.co.uk"
        })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Email sent successfully to admin@nhs.co.uk");
          done();
        });
    });

    it("should requires an email address", done => {
      request(args.app)
        .post("/auth/forgot")
        .send({})
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(Constants.ERRORS.VALIDATION_ERROR);
          expect(res.body.data.errors.email.message).toEqual(
            "should have required property 'email'"
          );
          done();
        });
    });

    it("should requires a valid email address", done => {
      request(args.app)
        .post("/auth/forgot")
        .send({
          email: "admin"
        })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(Constants.ERRORS.VALIDATION_ERROR);
          expect(res.body.data.errors.email.message).toEqual('should match format "email"');
          done();
        });
    });

    it("should return an error if user doesnt exist", done => {
      request(args.app)
        .post("/auth/forgot")
        .send({ email: "invalid@email.com" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(Constants.ERRORS.FORGOT_PASSWORD);
          expect(res.body.message).toEqual("User not found with email invalid@email.com");
          done();
        });
    });
  });

  describe("# POST /auth/resend", () => {
    it("should resend the notification", done => {
      request(args.app)
        .post("/auth/resend")
        .set("Authorization", `Bearer ${args.token}`)
        .send({ email: "admin@nhs.co.uk" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Email sent successfully to admin@nhs.co.uk");
          done();
        });
    });
    it("should require an email", done => {
      request(args.app)
        .post("/auth/resend")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.data.errors.email.message).toEqual(
            "should have required property 'email'"
          );
          done();
        });
    });
    it("should require a valid email", done => {
      request(args.app)
        .post("/auth/resend")
        .send({ email: "admin" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.data.errors.email.message).toEqual('should match format "email"');
          done();
        });
    });
    it("should also work for unauthenticated users", done => {
      request(args.app)
        .post("/auth/resend")
        .send({ email: "admin@nhs.co.uk" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Email sent successfully to admin@nhs.co.uk");
          done();
        });
    });
    it("should return an error if the user doesnt exist", done => {
      request(args.app)
        .post("/auth/resend")
        .set("Authorization", `Bearer ${args.token}`)
        .send({ email: "invalid@nhs.co.uk" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("User not found with email invalid@nhs.co.uk");
          done();
        });
    });
  });

  describe("# POST /users/:id/role", () => {
    it("should assign the admin role to the user", done => {
      request(args.app)
        .post(`/users/${args.user.id}/role`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual("David");
          expect(res.body.data.role).toEqual("Administrator");
          done();
        });
    });
    it("should work only for authenticated users", done => {
      request(args.app)
        .post(`/users/${args.user.id}/role`)
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
    it("should work only for admin users", async done => {
      args.user.role = "";
      const atlasUser = await args.user.save();
      request(args.app)
        .post(`/users/${atlasUser.id}/role`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("You are not allowed to perform that operation");
          done();
        });
    });
    it("should return an error if the user not found", done => {
      request(args.app)
        .post("/users/56c787ccc67fc16ccc1a5e92/role")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("User not found with id 56c787ccc67fc16ccc1a5e92");
          done();
        });
    });
  });

  describe("# GET /user/events/status", () => {
    describe("when calling the upload", () => {
      describe("when the upload is in progress", () => {
        it("should return the openUploads", done => {
          request(args.app)
            .put(`/experiments/${args.experimentId}/file`)
            .set("Authorization", `Bearer ${args.token}`)
            .field("resumableChunkNumber", 1)
            .field("resumableChunkSize", 1517242)
            .field("resumableCurrentChunkSize", 251726)
            .field("resumableTotalSize", 5034482)
            .field("resumableType", "application/json")
            .field("resumableIdentifier", "251726-333-08json")
            .field("resumableFilename", "333-08-large.json")
            .field("resumableRelativePath", "333-08-large.json")
            .field("resumableTotalChunks", 2)
            .field("checksum", "517553ce74f55f6162ba0939e3c42c7e")
            .attach("file", "test/fixtures/files/333-08-large.json")
            .expect(httpStatus.OK)
            .end(() => {
              request(args.app)
                .get("/user/events/status")
                .set("Authorization", `Bearer ${args.token}`)
                .expect(httpStatus.OK)
                .end((err, res) => {
                  expect(res.body.status).toEqual("success");
                  expect(res.body.data.openUploads.length).toEqual(1);

                  const openUpload = res.body.data.openUploads[0];
                  expect(openUpload.id).toEqual(args.experimentId);
                  expect(openUpload.complete).toEqual(false);
                  expect(openUpload.percentageComplete).toEqual(50);
                  done();
                });
            });
        });
      });
      describe("when the upload is completed", () => {
        it("should clear the openUploads", done => {
          request(args.app)
            .put(`/experiments/${args.experimentId}/file`)
            .set("Authorization", `Bearer ${args.token}`)
            .field("resumableChunkNumber", 1)
            .field("resumableChunkSize", 1048576)
            .field("resumableCurrentChunkSize", 251726)
            .field("resumableTotalSize", 251726)
            .field("resumableType", "application/json")
            .field("resumableIdentifier", "251726-333-08json")
            .field("resumableFilename", "333-08.json")
            .field("resumableRelativePath", "333-08.json")
            .field("resumableTotalChunks", 1)
            .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
            .attach("file", "test/fixtures/files/333-08.json")
            .expect(httpStatus.OK)
            .end(() => {
              request(args.app)
                .get("/user/events/status")
                .set("Authorization", `Bearer ${args.token}`)
                .expect(httpStatus.OK)
                .end((err, res) => {
                  expect(res.body.status).toEqual("success");
                  expect(res.body.data.openUploads.length).toEqual(0);
                  done();
                });
            });
        });
      });
      describe("when the user is not authenticated", () => {
        it("should return an error", done => {
          request(args.app)
            .get("/user/events/status")
            .set("Authorization", "Bearer INVALID_TOKEN")
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.message).toEqual("Not Authorised");
              done();
            });
        });
      });
    });
    describe("when uploading from a 3rd party provider", () => {
      describe("when the upload is in progress", () => {
        it("should return the openUploads", done => {
          request(args.app)
            .put(`/experiments/${args.experimentId}/provider`)
            .set("Authorization", `Bearer ${args.token}`)
            .send({
              provider: "dropbox",
              name: "MDR.fastq.gz",
              path: "https://dl.dropboxusercontent.com/1/view/1234"
            })
            .expect(httpStatus.OK)
            .end(() => {
              request(args.app)
                .get("/user/events/status")
                .set("Authorization", `Bearer ${args.token}`)
                .expect(httpStatus.OK)
                .end((err, res) => {
                  expect(res.body.status).toEqual("success");
                  expect(res.body.data.openUploads.length).toEqual(1);

                  const openUpload = res.body.data.openUploads[0];
                  expect(openUpload.id).toEqual(args.experimentId);
                  expect(openUpload.provider).toEqual("dropbox");
                  expect(openUpload.totalSize).toEqual(23);
                  done();
                });
            });
        });
      });
    });
    describe("when calling the analysis api", () => {
      describe("when the api call is triggered", () => {
        it("should return the openAnalysis", done => {
          request(args.app)
            .put(`/experiments/${args.experimentId}/file`)
            .set("Authorization", `Bearer ${args.token}`)
            .field("resumableChunkNumber", 1)
            .field("resumableChunkSize", 1048576)
            .field("resumableCurrentChunkSize", 251726)
            .field("resumableTotalSize", 251726)
            .field("resumableType", "application/json")
            .field("resumableIdentifier", "251726-333-08json")
            .field("resumableFilename", "333-08.json")
            .field("resumableRelativePath", "333-08.json")
            .field("resumableTotalChunks", 1)
            .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
            .attach("file", "test/fixtures/files/333-08.json")
            .expect(httpStatus.OK)
            .end(() => {
              request(args.app)
                .get("/user/events/status")
                .set("Authorization", `Bearer ${args.token}`)
                .expect(httpStatus.OK)
                .end((err, res) => {
                  expect(res.body.status).toEqual("success");
                  expect(res.body.data.openAnalysis.length).toEqual(1);

                  const analysis = res.body.data.openAnalysis[0];
                  expect(analysis.id).toEqual(args.experimentId);
                  expect(analysis.fileLocation).toBeTruthy();
                  done();
                });
            });
        });
      });
      describe("when the api call is completed", () => {
        it("should clear the openAnalysis", done => {
          request(args.app)
            .put(`/experiments/${args.experimentId}/file`)
            .set("Authorization", `Bearer ${args.token}`)
            .field("resumableChunkNumber", 1)
            .field("resumableChunkSize", 1048576)
            .field("resumableCurrentChunkSize", 251726)
            .field("resumableTotalSize", 251726)
            .field("resumableType", "application/json")
            .field("resumableIdentifier", "251726-333-08json")
            .field("resumableFilename", "333-08.json")
            .field("resumableRelativePath", "333-08.json")
            .field("resumableTotalChunks", 1)
            .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
            .attach("file", "test/fixtures/files/333-08.json")
            .expect(httpStatus.OK)
            .end(() => {
              request(args.app)
                .post(`/experiments/${args.experimentId}/results`)
                .set("Authorization", `Bearer ${args.token}`)
                .send(MDR)
                .expect(httpStatus.OK)
                .end(() => {
                  request(args.app)
                    .get("/user/events/status")
                    .set("Authorization", `Bearer ${args.token}`)
                    .expect(httpStatus.OK)
                    .end((err, res) => {
                      expect(res.body.status).toEqual("success");
                      expect(res.body.data.openAnalysis.length).toEqual(0);
                      done();
                    });
                });
            });
        });
      });
    });
    describe("when calling the search api", () => {
      describe("when the search api call is triggered", () => {
        it("should return the openSearches", done => {
          request(args.app)
            .get("/experiments/search?q=rpoB_S450L")
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(() => {
              request(args.app)
                .get("/user/events/status")
                .set("Authorization", `Bearer ${args.token}`)
                .expect(httpStatus.OK)
                .end((err, res) => {
                  expect(res.body.status).toEqual("success");
                  expect(res.body.data.openSearches.length).toEqual(1);

                  const search = res.body.data.openSearches[0];
                  expect(search.bigsi.query.gene).toEqual("rpoB");
                  expect(search.bigsi.query.ref).toEqual("S");
                  expect(search.bigsi.query.pos).toEqual(450);
                  expect(search.bigsi.query.alt).toEqual("L");
                  expect(search.type).toEqual("protein-variant");
                  done();
                });
            });
        });
      });
      describe("when the api call is completed", () => {
        it("should clear the openSearches", done => {
          request(args.app)
            .get("/experiments/search?q=rpoB_S234J")
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              const searchId = res.body.data.id;
              request(args.app)
                .put(`/searches/${searchId}/results`)
                .set("Authorization", `Bearer ${args.token}`)
                .send(searches.results.proteinVariant)
                .expect(httpStatus.OK)
                .end(() => {
                  request(args.app)
                    .get("/user/events/status")
                    .set("Authorization", `Bearer ${args.token}`)
                    .expect(httpStatus.OK)
                    .end((err1, res1) => {
                      expect(res1.body.status).toEqual("success");
                      expect(res1.body.data.openSearches.length).toEqual(0);
                      done();
                    });
                });
            });
        });
      });
    });
  });
});
