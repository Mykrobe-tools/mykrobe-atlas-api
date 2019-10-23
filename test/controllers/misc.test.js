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
  await User.remove({});
});

describe("Misc", () => {
  describe("# GET /health-check", () => {
    it("should return OK", done => {
      request(app)
        .get("/health-check")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("OK");
          done();
        });
    });
  });

  describe("# GET /404", () => {
    it("should return 404 status", done => {
      request(app)
        .get("/404")
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.message).toEqual("Unknown API route.");
          done();
        });
    });
  });

  describe("# Error Handling", () => {
    it("should handle mongoose CastError - Cast to ObjectId failed", done => {
      request(app)
        .get("/users/56z787zzz67fc")
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .end((err, res) => {
          expect(res.body.code).toEqual(10001);
          expect(res.body.message).toEqual(
            'Cast to ObjectId failed for value "56z787zzz67fc" at path "_id" for model "User"'
          );
          done();
        });
    });

    it("should handle express validation error - email is required", done => {
      request(app)
        .post("/users")
        .send({
          firstname: "Yassire",
          lastname: "Elhani",
          password: "password",
          phone: "+44787350038297"
        })
        .expect(httpStatus.BAD_REQUEST)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.data.errors.username.message).toEqual(
            "should have required property 'username'"
          );
          done();
        });
    });
  });
});
