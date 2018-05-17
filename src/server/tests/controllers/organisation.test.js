import request from "supertest";
import httpStatus from "http-status";
import chai, { expect } from "chai";
import dirtyChai from "dirty-chai";
import { createApp } from "../setup";
import User from "../../models/user.model";
import Organisation from "../../models/organisation.model";

const app = createApp();

const users = require("../fixtures/users");
const experiments = require("../fixtures/experiments");

chai.config.includeStack = true;
chai.use(dirtyChai);

let token = null;
let id = null;

beforeEach(done => {
  const userData = new User(users.admin);
  const organisationData = new Organisation(
    experiments.tuberculosis.organisation
  );
  userData.save().then(() => {
    request(app)
      .post("/auth/login")
      .send({ email: "admin@nhs.co.uk", password: "password" })
      .end((err, res) => {
        token = res.body.data.token;
        organisationData.save().then(savedOrganisation => {
          id = savedOrganisation.id;
          done();
        });
      });
  });
});

afterEach(done => {
  User.remove({}).then(() => {
    Organisation.remove({}, done);
  });
});

describe("## Experiment APIs", () => {
  describe("# POST /organisations", () => {
    it("should create a new experiment", done => {
      request(app)
        .post("/organisations")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Make and Ship" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal("success");
          expect(res.body.data.name).to.equal("Make and Ship");
          done();
        });
    });

    it("should work only for authenticated users", done => {
      request(app)
        .post("/organisations")
        .set("Authorization", "Bearer INVALID_TOKEN")
        .send({ name: "Make and Ship" })
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).to.equal("error");
          expect(res.body.message).to.equal("jwt malformed");
          done();
        });
    });
  });

  describe("# GET /organisations/:id", () => {
    it("should get organisation details", done => {
      request(app)
        .get(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal("success");
          expect(res.body.data.name).to.equal("Apex Entertainment");
          done();
        });
    });

    it("should report error with message - Not found, when organisation does not exists", done => {
      request(app)
        .get("/organisations/56c787ccc67fc16ccc1a5e92")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.message).to.equal(
            "Organisation not found with id 56c787ccc67fc16ccc1a5e92"
          );
          done();
        });
    });

    it("should remove unwanted fields", done => {
      request(app)
        .get(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data._id).to.be.an("undefined");
          expect(res.body.data.__v).to.be.an("undefined");
          done();
        });
    });

    it("should add virtual fields", done => {
      request(app)
        .get(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.id).to.equal(id);
          done();
        });
    });
  });

  describe("# PUT /organisations/:id", () => {
    it("should update organisation details", done => {
      const data = {
        name: "Make and Ship"
      };
      request(app)
        .put(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(data)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.name).to.equal("Make and Ship");
          done();
        });
    });
    it("should update organisation template", done => {
      const data = {
        template: "Microtitre plate"
      };
      request(app)
        .put(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(data)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal("success");
          expect(res.body.data.name).to.equal("Apex Entertainment");
          expect(res.body.data.template).to.equal("Microtitre plate");
          done();
        });
    });
  });

  describe("# GET /organisations", () => {
    it("should get all organisations", done => {
      request(app)
        .get("/organisations")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data).to.be.an("array");
          expect(res.body.data.length).to.equal(1);
          done();
        });
    });
  });

  describe("# DELETE /organisations/:id", () => {
    it("should delete organisation", done => {
      request(app)
        .delete(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal("success");
          expect(res.body.data).to.equal(
            "Organisation was successfully deleted."
          );
          done();
        });
    });

    it("should return an error if organisation not found", done => {
      request(app)
        .delete("/organisations/589dcdd38d71fee259dc4e00")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal("error");
          expect(res.body.message).to.equal(
            "Organisation not found with id 589dcdd38d71fee259dc4e00"
          );
          done();
        });
    });
  });
});
