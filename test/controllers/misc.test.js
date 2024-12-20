import request from "supertest";
import httpStatus from "http-status";

import Constants from "../../src/server/Constants";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";

import users from "../fixtures/users";

const args = {
  app: null
};

beforeAll(async () => {
  args.app = await createApp({ corsOptions: { origin: "example.com" } });
});

beforeEach(async () => {
  const userData = new User(users.admin);
  await userData.save();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("Misc", () => {
  describe("# GET /health-check", () => {
    it("should return OK", done => {
      request(args.app)
        .get("/health-check")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("OK");
          done();
        });
    });
    it("should set the cors headers", done => {
      request(args.app)
        .get("/health-check")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.headers["access-control-allow-origin"]).toEqual("example.com");
          done();
        });
    });
  });

  describe("# GET /404", () => {
    it("should return 404 status", done => {
      request(args.app)
        .get("/404")
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.code).toEqual(Constants.ERRORS.ROUTE_NOT_FOUND);
          expect(res.body.message).toEqual("Unknown API route");
          done();
        });
    });
  });

  describe("# Error Handling", () => {
    it("should handle mongoose CastError - Cast to ObjectId failed", done => {
      request(args.app)
        .get("/users/56z787zzz67fc")
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .end((err, res) => {
          expect(res.body.code).toEqual(Constants.ERRORS.GET_USER);
          expect(res.body.message).toEqual(
            'Cast to ObjectId failed for value "56z787zzz67fc" at path "_id" for model "User"'
          );
          done();
        });
    });

    it("should handle express validation error - email is required", done => {
      request(args.app)
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
