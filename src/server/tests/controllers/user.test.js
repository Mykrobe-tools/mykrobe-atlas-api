import request from "supertest";
import httpStatus from "http-status";
import { createApp } from "../setup";
import User from "../../models/user.model";
import Organisation from "../../models/organisation.model";
import Search from "../../models/search.model";
import Experiment from "../../models/experiment.model";

const app = createApp();

const users = require("../fixtures/users");
const searches = require("../fixtures/searches");
const experiments = require("../fixtures/experiments");

let savedUser = null;
let token = null;

beforeEach(async done => {
  const userData = new User(users.admin);
  const user = await userData.save();
  savedUser = user;
  request(app)
    .post("/auth/login")
    .send({ email: "admin@nhs.co.uk", password: "password" })
    .end((err, res) => {
      token = res.body.data.access_token;
      done();
    });
});

afterEach(async done => {
  await User.remove({});
  await Organisation.remove({});
  done();
});

describe("## User APIs", () => {
  const user = {
    firstname: "David",
    lastname: "Robin",
    password: "password",
    phone: "094324783253",
    email: "david@gmail.com"
  };

  describe("# POST /users", () => {
    it("should create a new user", done => {
      request(app)
        .post("/users")
        .send(user)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual(user.firstname);
          expect(res.body.data.lastname).toEqual(user.lastname);
          expect(res.body.data.phone).toEqual(user.phone);
          expect(res.body.data.email).toEqual(user.email);
          done();
        });
    });

    it("should validate user before creation - email", done => {
      const invalid = {
        firstname: "David",
        lastname: "Robin",
        password: "password"
      };
      request(app)
        .post("/users")
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(10005);
          expect(res.body.data.errors[""].message).toEqual(
            "should have required property 'email'"
          );
          done();
        });
    });

    it("should validate user before creation - password", done => {
      const invalid = {
        firstname: "David",
        lastname: "Robin",
        email: "admin@gmail.com"
      };
      request(app)
        .post("/users")
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(10005);
          expect(res.body.data.errors[""].message).toEqual(
            "should have required property 'password'"
          );
          done();
        });
    });

    it("should not save duplicate emails", done => {
      const invalid = {
        firstname: "David",
        lastname: "Robin",
        password: "password",
        phone: "06734929442",
        email: "admin@nhs.co.uk"
      };
      request(app)
        .post("/users")
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual("ValidationError");
          expect(res.body.message).toEqual(
            "User validation failed: email: admin@nhs.co.uk has already been registered"
          );
          done();
        });
    });

    it("should validate user before creation - email", done => {
      const invalid = {
        firstname: "David",
        lastname: "Robin",
        phone: "094324783253",
        email: "david",
        password: "password"
      };
      request(app)
        .post("/users")
        .send(invalid)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(10005);
          expect(res.body.data.errors.email.message).toEqual(
            'should match format "email"'
          );
          done();
        });
    });

    it("should save a valid keycloak id", done => {
      request(app)
        .post("/users")
        .send(user)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual(user.firstname);
          expect(res.body.data.lastname).toEqual(user.lastname);
          expect(res.body.data.phone).toEqual(user.phone);
          expect(res.body.data.email).toEqual(user.email);
          expect(res.body.data.keycloakId).toBeTruthy();
          done();
        });
    });
  });

  describe("# GET /users/:id", () => {
    beforeEach(async done => {
      const org = new Organisation({
        name: "Apex Entertainment",
        template: "MODS"
      });
      const savedOrg = await org.save();
      savedUser.organisation = savedOrg;
      await savedUser.save();
      done();
    });
    it("should get user details", done => {
      request(app)
        .get(`/users/${savedUser.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual(savedUser.firstname);
          expect(res.body.data.lastname).toEqual(savedUser.lastname);
          done();
        });
    });
    it("should get user details with organisation", done => {
      request(app)
        .get(`/users/${savedUser.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual(savedUser.firstname);
          expect(res.body.data.lastname).toEqual(savedUser.lastname);
          expect(res.body.data.organisation.name).toEqual("Apex Entertainment");
          expect(res.body.data.organisation.template).toEqual("MODS");
          done();
        });
    });
    it("should report error with message - Not found, when user does not exists", done => {
      request(app)
        .get("/users/56c787ccc67fc16ccc1a5e92")
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.message).toEqual(
            "User not found with id 56c787ccc67fc16ccc1a5e92"
          );
          done();
        });
    });

    it("should remove unwanted fields", done => {
      request(app)
        .get(`/users/${savedUser.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data._id).toBeUndefined();
          expect(res.body.data.__v).toBeUndefined();
          expect(res.body.data.password).toBeUndefined();
          done();
        });
    });

    it("should add virtual fields", done => {
      request(app)
        .get(`/users/${savedUser.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.id).toEqual(savedUser.id);
          done();
        });
    });
  });

  describe("# GET /user", () => {
    it("should return the current user details", done => {
      request(app)
        .get("/user")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual("David");
          expect(res.body.data.lastname).toEqual("Robin");
          done();
        });
    });
    it("should return an error if user not found", done => {
      request(app)
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
      request(app)
        .put(`/users/${savedUser.id}`)
        .set("Authorization", `Bearer ${token}`)
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
      request(app)
        .put("/user")
        .set("Authorization", `Bearer ${token}`)
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
      request(app)
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
      request(app)
        .get("/users")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          done();
        });
    });
  });

  describe("# DELETE /users/:id", () => {
    it("should delete user", done => {
      request(app)
        .delete(`/users/${savedUser.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Account was successfully deleted.");
          done();
        });
    });

    it("should return an erro if user not found", done => {
      request(app)
        .delete("/users/589dcdd38d71fee259dc4e00")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            "User not found with id 589dcdd38d71fee259dc4e00"
          );
          done();
        });
    });
  });

  describe("# DELETE /user", () => {
    it("should delete the current user", done => {
      request(app)
        .delete("/user")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Account was successfully deleted.");
          done();
        });
    });
    it("should return an error if user not authenticated", done => {
      request(app)
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
      request(app)
        .put(`/users/${savedUser.id}`)
        .set("Authorization", `Bearer ${token}`)
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
      request(app)
        .put(`/users/${savedUser.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ email: "", phone: "0576237437993" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual("ValidationError");
          expect(res.body.data.errors.email.message).toEqual(
            'should match format "email"'
          );
          done();
        });
    });
    it("should keep phone value if not provided", done => {
      request(app)
        .put(`/users/${savedUser.id}`)
        .set("Authorization", `Bearer ${token}`)
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
      request(app)
        .put(`/users/${savedUser.id}`)
        .set("Authorization", `Bearer ${token}`)
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
      request(app)
        .put(`/users/${savedUser.id}`)
        .set("Authorization", `Bearer ${token}`)
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
      request(app)
        .post("/auth/forgot")
        .send({
          email: "admin@nhs.co.uk"
        })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual(
            "Email sent successfully to admin@nhs.co.uk"
          );
          done();
        });
    });

    it("should requires an email address", done => {
      request(app)
        .post("/auth/forgot")
        .send({})
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Failed to reset the password.");
          expect(res.body.data.errors[""].message).toEqual(
            "should have required property 'email'"
          );
          done();
        });
    });

    it("should requires a valid email address", done => {
      request(app)
        .post("/auth/forgot")
        .send({
          email: "admin"
        })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Failed to reset the password.");
          expect(res.body.data.errors.email.message).toEqual(
            'should match format "email"'
          );
          done();
        });
    });

    it("should return an error if user doesnt exist", done => {
      request(app)
        .post("/auth/forgot")
        .send({ email: "invalid@email.com" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(10006);
          expect(res.body.message).toEqual(
            "The object requested was not found."
          );
          done();
        });
    });
  });

  describe("# POST /auth/resend", () => {
    it("should resend the notification", done => {
      request(app)
        .post("/auth/resend")
        .set("Authorization", `Bearer ${token}`)
        .send({ email: "admin@nhs.co.uk" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual(
            "Email sent successfully to admin@nhs.co.uk"
          );
          done();
        });
    });
    it("should require an email", done => {
      request(app)
        .post("/auth/resend")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            "Failed to resend the notification."
          );
          expect(res.body.data.errors[""].message).toEqual(
            "should have required property 'email'"
          );
          done();
        });
    });
    it("should require a valid email", done => {
      request(app)
        .post("/auth/resend")
        .send({ email: "admin" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            "Failed to resend the notification."
          );
          expect(res.body.data.errors.email.message).toEqual(
            'should match format "email"'
          );
          done();
        });
    });
    it("should also work for unauthenticated users", done => {
      request(app)
        .post("/auth/resend")
        .send({ email: "admin@nhs.co.uk" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual(
            "Email sent successfully to admin@nhs.co.uk"
          );
          done();
        });
    });
    it("should return an error if the user doesnt exist", done => {
      request(app)
        .post("/auth/resend")
        .set("Authorization", `Bearer ${token}`)
        .send({ email: "invalid@nhs.co.uk" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            "The object requested was not found."
          );
          done();
        });
    });
  });

  describe("# POST /users/:id/role", () => {
    it("should assign the admin role to the user", done => {
      request(app)
        .post(`/users/${savedUser.id}/role`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.firstname).toEqual("David");
          expect(res.body.data.role).toEqual("Administrator");
          done();
        });
    });
    it("should work only for authenticated users", done => {
      request(app)
        .post(`/users/${savedUser.id}/role`)
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
    it("should work only for admin users", async done => {
      savedUser.role = "";
      const atlasUser = await savedUser.save();
      request(app)
        .post(`/users/${atlasUser.id}/role`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            "You are not allowed to perform this action."
          );
          done();
        });
    });
    it("should return an error if the user not found", done => {
      request(app)
        .post("/users/56c787ccc67fc16ccc1a5e92/role")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            "User not found with id 56c787ccc67fc16ccc1a5e92"
          );
          done();
        });
    });
  });

  describe("# PUT /users/:id/results/:resultId", () => {
    let proteinVariantSearchId = null;
    let sequenceSearchId = null;

    beforeEach(async done => {
      const proteinVariantSearchData = new Search(searches.proteinVariant);
      const sequenceSearchData = new Search(searches.sequence);
      sequenceSearchData.user = savedUser;
      const proteinVariantSearch = await proteinVariantSearchData.save();
      const sequenceSearch = await sequenceSearchData.save();
      proteinVariantSearchId = proteinVariantSearch.id;
      sequenceSearchId = sequenceSearch.id;
      done();
    });
    afterEach(async done => {
      await Search.remove({});
      done();
    });
    it("should save search result", done => {
      request(app)
        .put(`/users/${savedUser.id}/results/${sequenceSearchId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ERR017683: {
            percent_kmers_found: 100
          },
          ERR1149371: {
            percent_kmers_found: 90
          }
        })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.type).toEqual("sequence");
          const result = res.body.data.result;
          expect(result.ERR017683.percent_kmers_found).toEqual(100);
          expect(result.ERR1149371.percent_kmers_found).toEqual(90);
          const bigsi = res.body.data.bigsi;
          expect(bigsi.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
          expect(bigsi.threshold).toEqual(0.9);
          const owner = res.body.data.user;
          expect(owner.firstname).toEqual("David");
          done();
        });
    });
    it("should be a protected route", done => {
      request(app)
        .put(`/users/${savedUser.id}/results/${sequenceSearchId}`)
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
    it("should throw an error if the result doesnt exist", done => {
      request(app)
        .put(`/users/${savedUser.id}/results/56c787ccc67fc16ccc1a5e92`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ERR017683: {
            percent_kmers_found: 100
          },
          ERR1149371: {
            percent_kmers_found: 90
          }
        })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            "Search not found with id 56c787ccc67fc16ccc1a5e92"
          );
          done();
        });
    });
    it("should throw an error if the user is not the owner of the result", done => {
      request(app)
        .put(`/users/${savedUser.id}/results/${proteinVariantSearchId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ERR017683: {
            percent_kmers_found: 100
          },
          ERR1149371: {
            percent_kmers_found: 90
          }
        })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.data).toEqual(
            "User must be the owner of the search result"
          );
          done();
        });
    });
  });

  describe("# GET /users/:id/results/:resultId", () => {
    let sequenceSearchId = null;
    let proteinVariantSearchId = null;

    beforeEach(async done => {
      const proteinVariantSearchData = new Search(searches.proteinVariant);
      const proteinVariantSearch = await proteinVariantSearchData.save();

      const experimentWithMetadataResults = new Experiment(
        experiments.tbUploadMetadataResults
      );
      const savedExperimentWithMetadataResults = await experimentWithMetadataResults.save();
      const sequenceSearchData = new Search(searches.emptySequence);
      const result = {
        type: "sequence",
        result: {},
        query: {
          seq: "CAGTCCGTTTGTTCT",
          threshold: 0.8
        }
      };
      result.result[`${savedExperimentWithMetadataResults.id}`] = {
        percent_kmers_found: 100
      };
      sequenceSearchData.user = savedUser;
      sequenceSearchData.set("result", result);
      const sequenceSearch = await sequenceSearchData.save();
      sequenceSearchId = sequenceSearch.id;
      proteinVariantSearchId = proteinVariantSearch.id;
      done();
    });
    afterEach(async done => {
      await Search.remove({});
      done();
    });
    it("should return results with merged experiments", done => {
      request(app)
        .get(`/users/${savedUser.id}/results/${sequenceSearchId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");

          const data = res.body.data;
          expect(data.type).toEqual("sequence");
          expect(data.bigsi).toBeTruthy();
          expect(data.user).toBeTruthy();
          expect(data.result).toBeTruthy();

          const result = data.result;
          expect(result.type).toEqual("sequence");
          expect(result.experiments.length).toEqual(1);

          const experiment = result.experiments[0];
          expect(experiment.id).toBeTruthy();
          expect(experiment.metadata).toBeTruthy();
          expect(experiment.result).toBeTruthy();
          expect(experiment.result.percent_kmers_found).toEqual(100);

          done();
        });
    });
    it("should be a protected route", done => {
      request(app)
        .get(`/users/${savedUser.id}/results/${sequenceSearchId}`)
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
    it("should throw an error if the result doesnt exist", done => {
      request(app)
        .get(`/users/${savedUser.id}/results/56c787ccc67fc16ccc1a5e92`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            "Search not found with id 56c787ccc67fc16ccc1a5e92"
          );
          done();
        });
    });
    it.only("should throw an error if the user is not the owner of the result", done => {
      request(app)
        .get(`/users/${savedUser.id}/results/${proteinVariantSearchId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.data).toEqual(
            "User must be the owner of the search result"
          );
          done();
        });
    });
  });
});
