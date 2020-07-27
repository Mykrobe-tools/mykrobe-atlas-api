import request from "supertest";
import httpStatus from "http-status";
import faker from "faker";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Experiment from "../../src/server/models/experiment.model";

import DataHelper from "../../src/server/helpers/DataHelper";

const app = createApp();
const users = require("../fixtures/users");
const experiments = require("../fixtures/experiments");
let token = null;

beforeEach(async done => {
  const userData = new User(users.admin);

  const savedUser = await userData.save();
  request(app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end(async (err, res) => {
      token = res.body.data.access_token;
      done();
    });
});

afterEach(async done => {
  await User.deleteMany({});
  await Experiment.deleteMany({});
  done();
});

describe("DataController", () => {
  describe("POST /data/create", () => {
    it("should return a successful response", done => {
      request(app)
        .post("/data/create")
        .send({ total: 1 })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.length).toEqual(1);
          done();
        });
    });
    it("should create 5 users", done => {
      request(app)
        .post("/data/create")
        .send({ total: 1 })
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          expect(res.body.status).toEqual("success");
          const total = await User.count();
          expect(total).toEqual(6);
          done();
        });
    });
    it("should create the given number of experiments", done => {
      const random = faker.random.number({ min: 1, max: 5 });
      request(app)
        .post("/data/create")
        .send({ total: random })
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          expect(res.body.status).toEqual("success");
          const total = await Experiment.count();
          expect(total).toEqual(random);
          done();
        });
    });
    it("should populate the experiment file", done => {
      request(app)
        .post("/data/create")
        .send({ total: 1 })
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data[0].file).toBeTruthy();
          done();
        });
    });
    it("should populate the experiment metadata", done => {
      request(app)
        .post("/data/create")
        .send({ total: 1 })
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data[0].metadata).toBeTruthy();
          done();
        });
    });
    it("should populate experiment results", done => {
      request(app)
        .post("/data/create")
        .send({ total: 1 })
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          const body = res.body;
          expect(body).toHaveProperty("status", "success");
          expect(body).toHaveProperty("data");

          const data = body.data;
          expect(data.length).toBeTruthy();
          const first = data[0];
          expect(first).toHaveProperty("results");
          const results = first.results;

          const keys = Object.keys(results);

          const hasPredictor = keys.includes("predictor");
          const hasDistance = keys.includes("distance");
          const hasNearestNeighbour = keys.includes("distance-nearest-neighbour");
          const hasTreeDistance = keys.includes("distance-tree-distance");

          expect(hasPredictor || hasDistance || hasNearestNeighbour || hasTreeDistance).toEqual(
            true
          );

          done();
        });
    });
    it("should populate the experiment owner", done => {
      request(app)
        .post("/data/create")
        .send({ total: 1 })
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data[0].owner).toBeTruthy();
          done();
        });
    });
  });

  describe("POST /data/clean", () => {
    it("should return a successful response", done => {
      request(app)
        .post("/data/clean")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("data cleared successfully");
          done();
        });
    });
    it("should clear all users", done => {
      request(app)
        .post("/data/clean")
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          expect(res.body.status).toEqual("success");
          const total = await User.count();
          expect(total).toEqual(0);
          done();
        });
    });
    it("should clear all experiments", done => {
      request(app)
        .post("/data/clean")
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          expect(res.body.status).toEqual("success");
          const total = await Experiment.count();
          expect(total).toEqual(0);
          done();
        });
    });
  });

  describe("POST /data/bulk", () => {
    describe("when invalid", () => {
      it("should be a protected route", done => {
        request(app)
          .post("/data/bulk")
          .set("Authorization", "Bearer INVALID")
          .attach("file", "test/fixtures/experiments-demo/metadata_ena11.tsv")
          .expect(httpStatus.UNAUTHORIZED)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Not Authorised");
            done();
          });
      });
      it("should check if the file is zipped", done => {
        request(app)
          .post("/data/bulk")
          .set("Authorization", `Bearer ${token}`)
          .field("purge", true)
          .attach("file", "test/fixtures/files/333-08.json")
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Input file must be a zip file");
            done();
          });
      });
      it("should validate the zip content", done => {
        request(app)
          .post("/data/bulk")
          .set("Authorization", `Bearer ${token}`)
          .field("purge", true)
          .attach("file", "test/fixtures/files/invalid.zip")
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Cannot find metadata files");
            done();
          });
      });
      describe("when purge is true", () => {
        beforeEach(async done => {
          const experimentData = new Experiment(experiments.tbUploadMetadata);
          const experiment = await experimentData.save();
          request(app)
            .post("/data/bulk")
            .set("Authorization", `Bearer ${token}`)
            .field("purge", true)
            .attach("file", "test/fixtures/files/upload.zip")
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              let total = await Experiment.count();
              while (total < 3) {
                await DataHelper.sleep(100);
                total = await Experiment.count();
              }
              done();
            });
        });
        it("should not populate the value if unknown", async done => {
          const experiment = await Experiment.findOne({
            "metadata.sample.isolateId": "SAMN09100439"
          });

          expect(experiment.metadata.sample.countryIsolate).toEqual("UK");
          expect(experiment.metadata.sample.cityIsolate).toEqual("");

          done();
        });
        it("should not populate the results if no results file provided", async done => {
          const experiment = await Experiment.findOne({
            "metadata.sample.isolateId": "SAMEA3281359"
          });

          const { results } = experiment;
          expect(results.length).toEqual(0);

          done();
        });
      });
    });
    describe("when valid", () => {
      it("should successfully load the experiments", async done => {
        request(app)
          .post("/data/bulk")
          .set("Authorization", `Bearer ${token}`)
          .field("purge", true)
          .attach("file", "test/fixtures/files/upload.zip")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 3) {
              await DataHelper.sleep(100);
              total = await Experiment.count();
            }
            const experiment1 = await Experiment.findOne({
              "metadata.sample.isolateId": "SAMN09100439"
            });

            const experiment2 = await Experiment.findOne({
              "metadata.sample.isolateId": "SAMEA3281359"
            });

            const experiment3 = await Experiment.findOne({
              "metadata.sample.isolateId": "SAMEA3231775"
            });

            expect(experiment1.metadata.sample.countryIsolate).toEqual("UK");
            expect(experiment2.metadata.sample.countryIsolate).toEqual("AR");
            expect(experiment2.metadata.sample.cityIsolate).toEqual("Rosario");
            expect(experiment3.metadata.sample.countryIsolate).toEqual("AR");
            expect(experiment3.metadata.sample.cityIsolate).toEqual("Buenos Aires");

            done();
          });
      });
      describe("when purge is true", () => {
        beforeEach(async done => {
          const experimentData = new Experiment(experiments.tbUploadMetadata);
          const experiment = await experimentData.save();
          request(app)
            .post("/data/bulk")
            .set("Authorization", `Bearer ${token}`)
            .field("purge", true)
            .attach("file", "test/fixtures/files/upload.zip")
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              let total = await Experiment.count();
              while (total < 3) {
                await DataHelper.sleep(100);
                total = await Experiment.count();
              }
              done();
            });
        });
        it("should purge all the experiments", async done => {
          const total = await Experiment.count();
          expect(total).toEqual(3);
          done();
        });
        it("should replace the city and country", async done => {
          const experiment = await Experiment.findOne({
            "metadata.sample.isolateId": "SAMEA3281359"
          });

          expect(experiment.metadata.sample.countryIsolate).toEqual("AR");
          expect(experiment.metadata.sample.cityIsolate).toEqual("Rosario");

          done();
        });
        it("should populate geo data", async done => {
          const experiment = await Experiment.findOne({
            "metadata.sample.isolateId": "SAMEA3281359"
          });

          expect(experiment.metadata.sample.countryIsolate).toEqual("AR");
          expect(experiment.metadata.sample.cityIsolate).toEqual("Rosario");

          expect(experiment.metadata.sample.latitudeIsolate).toBeGreaterThan(-33);
          expect(experiment.metadata.sample.latitudeIsolate).toBeLessThan(-32.9);

          expect(experiment.metadata.sample.longitudeIsolate).toBeGreaterThan(-60.7);
          expect(experiment.metadata.sample.longitudeIsolate).toBeLessThan(-60.6);

          done();
        });
        it("should populate the results", async done => {
          const experiment = await Experiment.findOne({
            "metadata.sample.isolateId": "SAMN09100439"
          });

          const { results } = experiment;
          expect(results.length).toEqual(1);
          expect(results[0].type).toEqual("predictor");

          done();
        });
      });
      describe("when purge is false", () => {
        beforeEach(async done => {
          const experimentData = new Experiment(experiments.tbUploadMetadata);
          const experiment = await experimentData.save();
          request(app)
            .post("/data/bulk")
            .set("Authorization", `Bearer ${token}`)
            .attach("file", "test/fixtures/files/upload.zip")
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              let total = await Experiment.count();
              while (total < 4) {
                await DataHelper.sleep(100);
                total = await Experiment.count();
              }
              done();
            });
        });
        it("should keep the existing experiments", async done => {
          const total = await Experiment.count();
          expect(total).toEqual(4);
          done();
        });
      });
    });
  });
});
