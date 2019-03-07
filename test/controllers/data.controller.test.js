import request from "supertest";
import httpStatus from "http-status";
import faker from "faker";

import { createApp } from "../setup";
import { mockEsCalls } from "../mocks";

import User from "../../src/server/models/user.model";
import Experiment from "../../src/server/models/experiment.model";

mockEsCalls();

const app = createApp();

beforeEach(async done => {
  await User.remove({});
  await Experiment.remove({});
  done();
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
          expect(total).toEqual(5);
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
});
