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
    it("should populate the experiment file", done => {
      request(args.app)
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
          const hasNearestNeighbour = keys.includes("distance-nearest-neighbour");
          const hasTreeDistance = keys.includes("distance-tree-distance");

          expect(hasPredictor || hasDistance || hasNearestNeighbour || hasTreeDistance).toEqual(
            true
          );

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

  describe("POST /data/demo", () => {
    describe("when passing invalid data", () => {
      it("should be a protected route", done => {
        request(args.app)
          .post("/data/demo")
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
    describe("when using purge", () => {
      beforeEach(async done => {
        const experimentData = new Experiment(experiments.tbUploadMetadata);
        const experiment = await experimentData.save();
        done();
      });
      it("should purge all the experiments", done => {
        request(args.app)
          .post("/data/demo")
          .set("Authorization", `Bearer ${args.token}`)
          .field("purge", "true")
          .attach("file", "test/fixtures/experiments-demo/metadata_ena11.tsv")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 11) {
              await DataHelper.sleep(100);
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Demo data upload started");
            expect(total).toEqual(11);
            done();
          });
      });
      it("should successfully load the experiments", done => {
        request(args.app)
          .post("/data/demo")
          .set("Authorization", `Bearer ${args.token}`)
          .field("purge", "true")
          .attach("file", "test/fixtures/experiments-demo/metadata_ena11.tsv")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 11) {
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Demo data upload started");
            const experiment = await Experiment.findOne({
              "metadata.sample.isolateId": "ERR550945"
            });
            expect(experiment.metadata.sample.countryIsolate).toEqual("PG");
            done();
          });
      });
      it("should replace the city and country", done => {
        request(args.app)
          .post("/data/demo")
          .set("Authorization", `Bearer ${args.token}`)
          .field("purge", "true")
          .attach("file", "test/fixtures/experiments-demo/metadata_ena11.tsv")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 11) {
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Demo data upload started");
            const experiment = await Experiment.findOne({
              "metadata.sample.isolateId": "SRR8237379"
            });
            expect(experiment.metadata.sample.countryIsolate).toEqual("CH");
            expect(experiment.metadata.sample.cityIsolate).toEqual("Geneva");
            done();
          });
      });
      it("should populate geo data", done => {
        request(args.app)
          .post("/data/demo")
          .set("Authorization", `Bearer ${args.token}`)
          .field("purge", "true")
          .attach("file", "test/fixtures/experiments-demo/metadata_ena11.tsv")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Demo data upload started");
            let experiment = await Experiment.findOne({
              "metadata.sample.isolateId": "SRR8237379"
            });
            while (!experiment || !experiment.metadata.sample.latitudeIsolate) {
              experiment = await Experiment.findOne({
                "metadata.sample.isolateId": "SRR8237379"
              });
            }
            expect(experiment.metadata.sample.countryIsolate).toEqual("CH");
            expect(experiment.metadata.sample.cityIsolate).toEqual("Geneva");

            expect(experiment.metadata.sample.latitudeIsolate).toBeGreaterThan(46.2);
            expect(experiment.metadata.sample.latitudeIsolate).toBeLessThan(47);

            expect(experiment.metadata.sample.longitudeIsolate).toBeGreaterThan(6.142);
            expect(experiment.metadata.sample.longitudeIsolate).toBeLessThan(6.147);
            done();
          });
      });
      it("should not populate the value if unknown", done => {
        request(args.app)
          .post("/data/demo")
          .set("Authorization", `Bearer ${args.token}`)
          .field("purge", "true")
          .attach("file", "test/fixtures/experiments-demo/metadata_ena11.tsv")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 11) {
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Demo data upload started");
            const experiment = await Experiment.findOne({
              "metadata.sample.isolateId": "ERR552694"
            });
            expect(experiment.metadata.sample.countryIsolate).toEqual("");
            expect(experiment.metadata.sample.cityIsolate).toEqual("");
            done();
          });
      });
    });
    describe("when purge is not set", () => {
      beforeEach(async done => {
        const experimentData = new Experiment(experiments.tbUploadMetadata);
        await experimentData.save();
        done();
      });
      it("should not purge the experiments", done => {
        request(args.app)
          .post("/data/demo")
          .set("Authorization", `Bearer ${args.token}`)
          .attach("file", "test/fixtures/experiments-demo/metadata_ena11.tsv")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 12) {
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Demo data upload started");
            expect(total).toEqual(12);
            done();
          });
      });
      it("should successfully load the experiments", done => {
        request(args.app)
          .post("/data/demo")
          .set("Authorization", `Bearer ${args.token}`)
          .attach("file", "test/fixtures/experiments-demo/metadata_ena11.tsv")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 12) {
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Demo data upload started");
            const experiment = await Experiment.findOne({
              "metadata.sample.isolateId": "ERR550945"
            });
            expect(experiment.metadata.sample.countryIsolate).toEqual("PG");
            done();
          });
      });
    });
  });
});
