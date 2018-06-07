import request from "supertest";
import httpStatus from "http-status";
import chai, { expect } from "chai";
import User from "../../models/user.model";
import { createApp } from "../setup";

const app = createApp();

chai.config.includeStack = true;

const users = require("../fixtures/users");

beforeEach(async () => {
  const userData = new User(users.admin);
  await userData.save();
});

afterEach(async () => {
  await User.remove({});
});

describe("## Misc", () => {
  describe("# GET /health-check", () => {
    it("should return OK", done => {
      request(app)
        .get("/health-check")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).to.equal("success");
          expect(res.body.data).to.equal("OK");
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
          expect(res.body.message).to.equal("Unknown API route.");
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
          expect(res.body.code).to.equal(10001);
          expect(res.body.message).to.equal(
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
          expect(res.body.message).to.equal('"email" is required');
          done();
        });
    });
  });
});
