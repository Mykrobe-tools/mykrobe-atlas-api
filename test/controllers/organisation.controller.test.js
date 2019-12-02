import request from "supertest";
import httpStatus from "http-status";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Organisation from "../../src/server/models/organisation.model";

const app = createApp();

const users = require("../fixtures/users");
const organisations = require("../fixtures/organisations");

let token = null;
let id = null;

beforeEach(async done => {
  const userData = new User(users.admin);
  const organisationData = new Organisation(organisations.apex);
  await userData.save();
  request(app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end(async (err, res) => {
      token = res.body.data.access_token;
      const savedOrganisation = await organisationData.save();
      id = savedOrganisation.id;
      done();
    });
});

afterEach(async done => {
  await User.deleteMany({});
  await Organisation.deleteMany({});
  done();
});

describe("OrganisationController", () => {
  describe("# POST /organisations", () => {
    it("should create a new organisation", done => {
      request(app)
        .post("/organisations")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Make and Ship" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.name).toEqual("Make and Ship");
          expect(res.body.data.slug).toEqual("make-and-ship");
          expect(res.body.data.ownersGroupId).toEqual("46e23392-1773-4ab0-9f54-14eb2200d077");
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
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
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
          expect(res.body.status).toEqual("success");
          expect(res.body.data.name).toEqual("Apex Entertainment");
          done();
        });
    });

    it("should report error with message - Not found, when organisation does not exists", done => {
      request(app)
        .get("/organisations/56c787ccc67fc16ccc1a5e92")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.message).toEqual(
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
          expect(res.body.data._id).toBeUndefined();
          expect(res.body.data.__v).toBeUndefined();
          done();
        });
    });

    it("should add virtual fields", done => {
      request(app)
        .get(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.id).toEqual(id);
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
          expect(res.body.data.name).toEqual("Make and Ship");
          done();
        });
    });
    it("should not update organisation slug", done => {
      const data = {
        name: "Make and Ship"
      };
      request(app)
        .put(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(data)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.name).toEqual("Make and Ship");
          expect(res.body.data.slug).toEqual("apex-entertainment");
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
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toEqual(1);
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
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Organisation was successfully deleted.");
          done();
        });
    });

    it("should return an error if organisation not found", done => {
      request(app)
        .delete("/organisations/589dcdd38d71fee259dc4e00")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            "Organisation not found with id 589dcdd38d71fee259dc4e00"
          );
          done();
        });
    });
  });
});
