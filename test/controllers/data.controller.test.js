import request from "supertest";
import httpStatus from "http-status";
import faker from "faker";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Experiment from "../../src/server/models/experiment.model";

const app = createApp();
const users = require("../fixtures/users");
const experiments = require("../fixtures/experiments");
let token = null;

/*
beforeEach(async done => {
  await User.remove({});
  await Experiment.remove({});
  done();
});
*/

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
  await User.remove({});
  await Experiment.remove({});
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
          const hasNearestNeighbours = keys.includes("nearestNeighbours");

          expect(hasPredictor || hasDistance || hasNearestNeighbours).toEqual(true);

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

  describe("POST /data/demo/:folder", () => {
    describe("when passing invalid data", () => {
      it("should be a protected route", done => {
        request(app)
          .post("/data/demo/experiments-demo")
          .set("Authorization", "Bearer INVALID")
          .expect(httpStatus.UNAUTHORIZED)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Not Authorised");
            done();
          });
      });
      it("should check if the folder exists", done => {
        request(app)
          .post("/data/demo/experiments-demo-invalid")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual(
              "Cannot find test/fixtures/experiments-demo-invalid directory"
            );
            done();
          });
      });
    });
    describe("when using purge", () => {
      beforeEach(async done => {
        const experimentData = new Experiment(experiments.tbUploadMetadata);
        await experimentData.save();
        done();
      });
      it("should purge all the experiments", done => {
        request(app)
          .post("/data/demo/experiments-demo?purge=true")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 11) {
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual(
              "Demo data upload started from test/fixtures/experiments-demo"
            );
            expect(total).toEqual(11);
            done();
          });
      });
      it("should successfully load the experiments", done => {
        request(app)
          .post("/data/demo/experiments-demo?purge=true")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 11) {
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual(
              "Demo data upload started from test/fixtures/experiments-demo"
            );
            const experiment = await Experiment.findOne({
              "metadata.sample.isolateId": "ERR550945"
            });
            expect(experiment.metadata.sample.countryIsolate).toEqual("PF");
            done();
          });
      });
      it("should replace the city and country", done => {
        request(app)
          .post("/data/demo/experiments-demo?purge=true")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 11) {
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual(
              "Demo data upload started from test/fixtures/experiments-demo"
            );
            const experiment = await Experiment.findOne({
              "metadata.sample.isolateId": "SRR8237379"
            });
            expect(experiment.metadata.sample.countryIsolate).toEqual("CH");
            expect(experiment.metadata.sample.cityIsolate).toEqual("Geneva");
            done();
          });
      });
      it("should not populate the value if unknown", done => {
        request(app)
          .post("/data/demo/experiments-demo?purge=true")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 11) {
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual(
              "Demo data upload started from test/fixtures/experiments-demo"
            );
            const experiment = await Experiment.findOne({
              "metadata.sample.isolateId": "ERR552694"
            });
            expect(experiment.metadata.sample.countryIsolate).toBeUndefined();
            expect(experiment.metadata.sample.cityIsolate).toBeUndefined();
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
        request(app)
          .post("/data/demo/experiments-demo")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 12) {
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual(
              "Demo data upload started from test/fixtures/experiments-demo"
            );
            expect(total).toEqual(12);
            done();
          });
      });
      it("should successfully load the experiments", done => {
        request(app)
          .post("/data/demo/experiments-demo")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let total = await Experiment.count();
            while (total < 12) {
              total = await Experiment.count();
            }
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual(
              "Demo data upload started from test/fixtures/experiments-demo"
            );
            const experiment = await Experiment.findOne({
              "metadata.sample.isolateId": "ERR550945"
            });
            expect(experiment.metadata.sample.countryIsolate).toEqual("PF");
            done();
          });
      });
    });
  });
});
