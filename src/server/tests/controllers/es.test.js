import request from "supertest";
import httpStatus from "http-status";
import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch";
import { createApp } from "../setup";
import User from "../../models/user.model";
import Experiment from "../../models/experiment.model";
import Organisation from "../../models/organisation.model";
import Metadata from "../../models/metadata.model";
import config from "../../../config/env/";
import experimentSchema from "../../../schemas/experiment";

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
      token = res.body.data.token;
      done();
    });
});

afterEach(async done => {
  await User.remove({});
  done();
});

beforeAll(async done => {
  await ElasticsearchHelper.deleteIndexIfExists(config);
  await ElasticsearchHelper.createIndex(config, experimentSchema, "experiment");

  const savedOrganisation = await organisationData.save();
  const savedMetadata = await metadataData.save();
  experimentData.organisation = savedOrganisation;
  experimentData.metadata = savedMetadata;
  const experiment = await experimentData.save();

  await ElasticsearchHelper.indexDocument(config, experiment, "experiment");

  let data = await ElasticsearchHelper.search(config, {}, "experiment");
  while (data.hits.total === 0) {
    data = await ElasticsearchHelper.search(config, {}, "experiment");
  }

  done();
});

describe("## Experiment APIs", () => {
  describe.skip("# GET /experiments/metadata/:attribute/values", () => {
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
          expect(res.body.message).toEqual("jwt malformed");
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
        .get("/experiments/search?metadata.smoker=No&metadata.imprisoned=Yes")
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
        .get("/experiments/search?metadata.smoker=No&metadata.imprisoned=Yes")
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
        .get("/experiments/search?metadata.smoker=No&metadata.imprisoned=Yes")
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("jwt malformed");
          done();
        });
    });
    it("should allow pagination", done => {
      request(app)
        .get(
          "/experiments/search?metadata.smoker=No&metadata.imprisoned=Yes&per=10&page=1"
        )
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
        .get(
          "/experiments/search?metadata.smoker=No&metadata.imprisoned=Yes&per=10&page=0"
        )
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
