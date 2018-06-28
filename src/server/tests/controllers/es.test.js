import request from "supertest";
import httpStatus from "http-status";
import { createApp } from "../setup";
import User from "../../models/user.model";
import Experiment from "../../models/experiment.model";
import Organisation from "../../models/organisation.model";
import Metadata from "../../models/metadata.model";
import ESHelper from "../../helpers/ESHelper";

jest.mock("keycloak-admin-client");

const app = createApp();

const users = require("../fixtures/users");

let token = null;

const experiments = require("../fixtures/experiments");
const metadata = require("../fixtures/metadata");

const organisationData = new Organisation(
  experiments.tuberculosis.organisation
);
const metadataData = new Metadata(metadata.basic);
const experimentData = new Experiment(experiments.tuberculosis);

beforeEach(async done => {
  const userData = new User(users.admin);
  await userData.save();
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
  done();
});

beforeAll(async done => {
  await ESHelper.deleteIndexIfExists();
  await ESHelper.createIndex();

  const savedOrganisation = await organisationData.save();
  const savedMetadata = await metadataData.save();
  experimentData.organisation = savedOrganisation;
  experimentData.metadata = savedMetadata;
  const experiment = await experimentData.save();

  const indexed = await ESHelper.indexExperiment(experimentData);

  done();
});

describe.skip("## Experiment APIs", () => {
  describe("# GET /experiments/metadata/:attribute/values", () => {
    it("should return distinct countries from ES", done => {
      request(app)
        .get("/experiments/metadata/countryOfBirth/values")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toEqual(1);
          expect(res.body.data[0]).toEqual("Hong Kong");
          done();
        });
    });
    it("should return distinct bmi values from ES", done => {
      request(app)
        .get("/experiments/metadata/bmi/values")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toEqual(1);
          expect(res.body.data[0]).toEqual(12);
          done();
        });
    });
    it("should return empty array if field unknown", done => {
      request(app)
        .get("/experiments/metadata/unknown/values")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toEqual(0);
          done();
        });
    });
    it("should be a protected route", done => {
      request(app)
        .get("/experiments/metadata/countryOfBirth/values")
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
  });
  describe("# GET /experiments/search", () => {
    it("should return experiment results", done => {
      request(app)
        .get("/experiments/search")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.results.length).toEqual(1);
          done();
        });
    });
    it("should filter by metadata fields", done => {
      request(app)
        .get("/experiments/search?smoker=No&imprisoned=Yes")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.results.length).toEqual(1);
          done();
        });
    });
    it("should include a summary", done => {
      request(app)
        .get("/experiments/search?smoker=No&imprisoned=Yes")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.summary.hits).toEqual(1);
          expect(res.body.data.results.length).toEqual(1);
          done();
        });
    });
    it("should be a protected route", done => {
      request(app)
        .get("/experiments/search?smoker=No&imprisoned=Yes")
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
    it("should allow pagination", done => {
      request(app)
        .get("/experiments/search?smoker=No&imprisoned=Yes&per=10&page=1")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.summary.hits).toEqual(1);
          expect(res.body.data.results.length).toEqual(1);
          done();
        });
    });
    it("should control the page value", done => {
      request(app)
        .get("/experiments/search?smoker=No&imprisoned=Yes&per=10&page=0")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            '"page" must be larger than or equal to 1'
          );
          done();
        });
    });
  });
});
