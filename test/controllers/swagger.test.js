import request from "supertest";
import httpStatus from "http-status";
import swaggerParser from "swagger-parser";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";

import users from "../fixtures/users";

const app = createApp();

beforeEach(async () => {
  const userData = new User(users.admin);
  await userData.save();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("Swagger", () => {
  describe("when serving swagger docs", () => {
    it("should serve a valid json", async done => {
      request(app)
        .get("/swagger.json")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.info.title).toEqual("Atlas API");
          expect(res.body.swagger).toEqual("2.0");
          done();
        });
    });

    it("should be valid against the swagger spec", async done => {
      request(app)
        .get("/swagger.json")
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          const body = res.body;

          try {
            const spec = await swaggerParser.validate(body);
            done();
          } catch (e) {
            fail(e);
            done();
          }
        });
    });

    it("should return a success response", async done => {
      request(app)
        .get("/swagger.json")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.status).toEqual(200);
          done();
        });
    });
  });
});
