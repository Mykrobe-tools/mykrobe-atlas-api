import request from "supertest";
import httpStatus from "http-status";
import faker from "faker";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Experiment from "../../src/server/models/experiment.model";

import DataHelper from "../../src/server/helpers/DataHelper";

import users from "../fixtures/users";
import experiments from "../fixtures/experiments";

const args = {
  app: null,
  token: null
};

beforeAll(async () => {
  args.app = await createApp();
});

beforeEach(async done => {
  const userData = new User(users.admin);

  const savedUser = await userData.save();
  request(args.app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end(async (err, res) => {
      args.token = res.body.data.access_token;
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
      request(args.app)
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
      request(args.app)
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
      request(args.app)
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
    it("should populate the experiment files", done => {
      request(args.app)
        .post("/data/create")
        .send({ total: 1 })
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data[0].files.length).toBeTruthy();
          done();
        });
    });
    it("should populate the experiment metadata", done => {
      request(args.app)
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
      request(args.app)
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

          expect(hasPredictor || hasDistance).toEqual(true);

          done();
        });
    });
    it("should populate the experiment owner", done => {
      request(args.app)
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
      request(args.app)
        .post("/data/clean")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("data cleared successfully");
          done();
        });
    });
    it("should clear all users", done => {
      request(args.app)
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
      request(args.app)
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
      describe("when the token is invalid", () => {
        it("should be a protected route", done => {
          request(args.app)
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
      });
      describe("when the file is not a zip", () => {
        it("should return an error", done => {
          request(args.app)
            .post("/data/bulk")
            .set("Authorization", `Bearer ${args.token}`)
            .field("purge", true)
            .attach("file", "test/fixtures/files/333-08.json")
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.message).toEqual("Input file must be a zip file");
              done();
            });
        });
      });
      describe("when the zip content is incomplete", () => {
        it("should return an error", done => {
          request(args.app)
            .post("/data/bulk")
            .set("Authorization", `Bearer ${args.token}`)
            .field("purge", true)
            .attach("file", "test/fixtures/files/invalid.zip")
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.message).toEqual("Cannot find metadata files");
              done();
            });
        });
      });
    });
    describe("when valid", () => {
      describe("when purge is true", () => {
        let total = 0;
        let status = null;
        let data = null;

        beforeEach(async done => {
          const experimentData = new Experiment(experiments.tbUploadMetadata);
          const experiment = await experimentData.save();

          request(args.app)
            .post("/data/bulk")
            .set("Authorization", `Bearer ${args.token}`)
            .field("purge", true)
            .attach("file", "test/fixtures/files/upload.zip")
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              status = res.body.status;
              data = res.body.data;

              let total = await Experiment.count();
              while (total < 3) {
                await DataHelper.sleep(100);
                total = await Experiment.count();
              }

              done();
            });
        });
        it("should return success", done => {
          expect(status).toEqual("success");
          done();
        });
        it("should trigger loading the experiments", done => {
          expect(data).toEqual("Demo data upload started");
          done();
        });
        it("should purge all the experiments", async done => {
          const total = await Experiment.count();
          expect(total).toEqual(3);

          done();
        });
        it("should successfully load the experiments", async done => {
          const experiments = await Experiment.find({});
          const results = [];

          for (const experiment of experiments) {
            expect(experiment).toHaveProperty("metadata");
            expect(experiment).toHaveProperty("results");
            expect(experiment).toHaveProperty("id");

            for (const result of experiment.results) {
              results.push(result);
            }
          }

          for (const result of results) {
            expect(result).toHaveProperty("type", "predictor");
          }

          done();
        });
        it("should store city and country", async done => {
          const experiments = await Experiment.find({});

          for (const experiment of experiments) {
            expect(experiment).toHaveProperty("metadata");
            expect(experiment.metadata).toHaveProperty("sample");
            expect(experiment.metadata.sample).toHaveProperty("countryIsolate");
            expect(experiment.metadata.sample).toHaveProperty("cityIsolate");

            expect(["UK", "AR", "ZA"]).toContain(experiment.metadata.sample.countryIsolate);
            expect(["Durban", "", "Buenos Aires"]).toContain(
              experiment.metadata.sample.cityIsolate
            );
          }

          done();
        });
        it("should store geo location", async done => {
          const experiments = await Experiment.find({});

          for (const experiment of experiments) {
            expect(experiment.metadata.sample).toHaveProperty("latitudeIsolate");
            expect(experiment.metadata.sample).toHaveProperty("longitudeIsolate");

            const { countryIsolate, cityIsolate } = experiment.metadata.sample;
            if (countryIsolate === "AR" && cityIsolate === "Rosario") {
              expect(experiment.metadata.sample.latitudeIsolate).toBeCloseTo(-32.96, 1);
              expect(experiment.metadata.sample.longitudeIsolate).toBeCloseTo(-60.69, 1);
            } else if (countryIsolate === "ZA" && cityIsolate === "Durban") {
              expect(experiment.metadata.sample.latitudeIsolate).toBeCloseTo(-123.95, 1);
              expect(experiment.metadata.sample.longitudeIsolate).toBeCloseTo(-5.69, 1);
            } else if (countryIsolate === "UK" && cityIsolate === "") {
              expect(experiment.metadata.sample.latitudeIsolate).toBeCloseTo(55.37, 1);
              expect(experiment.metadata.sample.longitudeIsolate).toBeCloseTo(-3.43, 1);
            }
          }
          done();
        });

        it("should store predictor results", async done => {
          const experiments = await Experiment.find({});
          const results = [];

          for (const experiment of experiments) {
            for (const result of experiment.results) {
              results.push(result);
            }
          }

          expect(results.length).toEqual(2);
          for (const result of results) {
            expect(result).toHaveProperty("type", "predictor");
          }

          done();
        });

        it("should store the sampleId", async done => {
          const experiments = await Experiment.find({});

          for (const experiment of experiments) {
            expect(experiment).toHaveProperty("sampleId");
            expect(experiment.sampleId).toBeTruthy();
          }

          done();
        });
      });
      describe("when purge is false", () => {
        beforeEach(async done => {
          const experimentData = new Experiment(experiments.tbUploadMetadata);
          const experiment = await experimentData.save();
          request(args.app)
            .post("/data/bulk")
            .set("Authorization", `Bearer ${args.token}`)
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
