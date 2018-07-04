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

jest.mock("keycloak-admin-client");

const app = createApp();

const users = require("../fixtures/users");

let token = null;

const experiments = require("../fixtures/experiments");
const metadata = require("../fixtures/metadata");

const organisationData = new Organisation(
  experiments.tuberculosis.organisation
);
const metadataData = new Metadata(metadata.sample1);
const experimentData = new Experiment(experiments.tuberculosis);
const metadataData2 = new Metadata(metadata.sample2);
const experimentData2 = new Experiment(experiments.pneumonia);

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
  await ElasticsearchHelper.deleteIndexIfExists(config);
  await ElasticsearchHelper.createIndex(config, experimentSchema, "experiment");

  // save first experiment
  const savedOrganisation = await organisationData.save();
  const savedMetadata = await metadataData.save();
  experimentData.organisation = savedOrganisation;
  experimentData.metadata = savedMetadata;
  await experimentData.save();

  // save second experiment
  const savedMetadata2 = await metadataData2.save();
  experimentData2.organisation = savedOrganisation;
  experimentData2.metadata = savedMetadata2;
  await experimentData2.save();

  // index to elasticsearch
  const experiments = await Experiment.list();
  await ElasticsearchHelper.indexDocuments(config, experiments, "experiment");

  let data = await ElasticsearchHelper.search(config, {}, "experiment");
  while (data.hits.total < 2) {
    data = await ElasticsearchHelper.search(config, {}, "experiment");
  }

  done();
});

afterAll(async done => {
  await ElasticsearchHelper.deleteIndexIfExists(config);
  await ElasticsearchHelper.createIndex(config, experimentSchema, "experiment");
  await Experiment.remove({});
  done();
});

describe("## Experiment APIs", () => {
  describe("# GET /experiments/metadata/choices", () => {
    it("should return min and max dates", done => {
      request(app)
        .get("/experiments/metadata/choices")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;
          expect(data["metadata.dateArrived"].min).toEqual(
            "2017-04-21T00:00:00.000Z"
          );
          expect(data["metadata.dateArrived"].max).toEqual(
            "2018-05-18T00:00:00.000Z"
          );
          done();
        });
    });
    it("should return min and max bmi values", done => {
      request(app)
        .get("/experiments/metadata/choices")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;
          expect(data["metadata.bmi"].min).toEqual(3);
          expect(data["metadata.bmi"].max).toEqual(12);
          done();
        });
    });
    it("should return min and max patient age", done => {
      request(app)
        .get("/experiments/metadata/choices")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;
          expect(data["metadata.patientAge"].min).toEqual(8);
          expect(data["metadata.patientAge"].max).toEqual(34);
          done();
        });
    });
    it("should filter the choices", done => {
      request(app)
        .get("/experiments/metadata/choices?metadata.patientId=12345")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;
          expect(data["metadata.patientAge"].min).toEqual(34);
          expect(data["metadata.patientAge"].max).toEqual(34);
          expect(data["metadata.bmi"].min).toEqual(12);
          expect(data["metadata.bmi"].max).toEqual(12);
          expect(data["metadata.dateArrived"].min).toEqual(
            "2017-04-21T00:00:00.000Z"
          );
          expect(data["metadata.dateArrived"].max).toEqual(
            "2017-04-21T00:00:00.000Z"
          );
          done();
        });
    });
    it("should not return null values", done => {
      request(app)
        .get("/experiments/metadata/choices?organisation.name=NHS")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;
          expect(data["metadata.patientAge"]).toEqual({});
          expect(data["metadata.bmi"]).toEqual({});
          expect(data["metadata.dateArrived"]).toEqual({});
          done();
        });
    });
    it("should be a protected route", done => {
      request(app)
        .get("/experiments/metadata/choices")
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
          expect(res.body.data.results.length).toEqual(2);
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
          expect(res.body.data.results.length).toEqual(2);
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
          expect(res.body.data.summary.hits).toEqual(2);
          expect(res.body.data.results.length).toEqual(2);
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
          expect(res.body.message).toEqual("Not Authorised");
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
          expect(res.body.data.summary.hits).toEqual(2);
          expect(res.body.data.results.length).toEqual(2);
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
