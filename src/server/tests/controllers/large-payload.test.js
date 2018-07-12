import request from "supertest";
import httpStatus from "http-status";
import { createApp, config } from "../setup";

const large = require("../fixtures/large");

const makeRequest = app =>
  request(app)
    .post("/users")
    .send(large);

describe("Large payload", () => {
  describe("when sending body below the limit", () => {
    const app = createApp();
    it("should return success response", async done => {
      makeRequest(app)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          done();
        });
    });
  });
  describe("when sending a body over the limit", () => {
    const app = createApp({ limit: "1kb" });
    it("should return payload too large error", async done => {
      makeRequest(app)
        .expect(httpStatus.REQUEST_TOO_LONG)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("request entity too large");
          done();
        });
    });
    it("should set the cors headers", async done => {
      makeRequest(app)
        .expect(httpStatus.REQUEST_TOO_LONG)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("request entity too large");
          expect(res.headers["access-control-allow-headers"]).toBeTruthy();
          expect(res.headers["access-control-allow-origin"]).toBeTruthy();
          done();
        });
    });
  });
});
