import request from "supertest";
import httpStatus from "http-status";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Group from "../../src/server/models/group.model";
import Search from "../../src/server/models/search.model";
import Experiment from "../../src/server/models/experiment.model";

import Constants from "../../src/server/Constants";

import users from "../fixtures/users";
import groups from "../fixtures/groups/default";
import searches from "../fixtures/searches";
import experiments from "../fixtures/experiments";
import SearchEventJSONTransformer from "../../src/server/transformers/events/SearchEventJSONTransformer";

import { parseQuery } from "../../src/server/modules/search/query-parser";
import GroupHelper from "../../src/server/helpers/GroupHelper";

const args = {
  app: null,
  token: null,
  id: null,
  group: null,
  user: null
};

beforeAll(async () => {
  args.app = await createApp();
});

beforeEach(async done => {
  const userData = new User(users.admin);
  const groupData = new Group(groups.salta);
  const { bigsi } = parseQuery({ q: groups.salta.searchQuery });
  const { type, query } = bigsi;
  groupData.search = await GroupHelper.getOrCreateSearch({ type, bigsi: { query } });
  args.user = await userData.save();
  request(args.app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end(async (err, res) => {
      args.token = res.body.data.access_token;
      args.group = await groupData.save();
      args.id = args.group.id;
      done();
    });
});

afterEach(async done => {
  await User.deleteMany({});
  await Experiment.deleteMany({});
  await Group.deleteMany({ name: { $in: ["Salta Group", "Tandil Group", "Make and Ship"] } });
  done();
});

describe("GroupController", () => {
  describe("POST /groups", () => {
    describe("when valid", () => {
      it("should create a new group", done => {
        request(args.app)
          .post("/groups")
          .set("Authorization", `Bearer ${args.token}`)
          .send(groups.tandil)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.name).toEqual("Tandil Group");
            done();
          });
      });
    });
    describe("when not valid", () => {
      describe("when the user is not authenticated", () => {
        it("should return an error", done => {
          request(args.app)
            .post("/groups")
            .set("Authorization", "Bearer INVALID_TOKEN")
            .send(groups.tandil)
            .expect(httpStatus.UNAUTHORIZED)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.NOT_ALLOWED);
              expect(res.body.message).toEqual("Not Authorised");
              done();
            });
        });
      });
      describe("when the group already exists", () => {
        describe("when the name already exists", () => {
          it("should return an error", done => {
            request(args.app)
              .post("/groups")
              .set("Authorization", `Bearer ${args.token}`)
              .send(groups.medoza)
              .expect(httpStatus.OK)
              .end((err, res) => {
                expect(res.body.status).toEqual("error");
                expect(res.body.data.errors.name).toHaveProperty(
                  "message",
                  "Group already exists with name Mendoza Group"
                );
                done();
              });
          });
        });
      });
    });
  });
  describe("GET /groups/:id", () => {
    it("should get group details", done => {
      request(args.app)
        .get(`/groups/${args.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.name).toEqual("Salta Group");
          done();
        });
    });

    it("should report error with message - Not found, when group does not exists", done => {
      request(args.app)
        .get("/groups/56c787ccc67fc16ccc1a5e92")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.message).toEqual("Group not found with id 56c787ccc67fc16ccc1a5e92");
          done();
        });
    });

    it("should remove unwanted fields", done => {
      request(args.app)
        .get(`/groups/${args.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data._id).toBeUndefined();
          expect(res.body.data.__v).toBeUndefined();
          done();
        });
    });

    it("should add virtual fields", done => {
      request(args.app)
        .get(`/groups/${args.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.id).toEqual(args.id);
          done();
        });
    });
  });
  describe("PUT /groups/:id", () => {
    describe("when valid", () => {
      it("should update group details", done => {
        const data = {
          name: "Make and Ship"
        };
        request(args.app)
          .put(`/groups/${args.id}`)
          .set("Authorization", `Bearer ${args.token}`)
          .send(data)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.data.name).toEqual("Make and Ship");
            done();
          });
      });
    });
    describe("when invalid", () => {
      it("should return an error", done => {
        const data = {
          name: "Mendoza Group"
        };
        request(args.app)
          .put(`/groups/${args.id}`)
          .set("Authorization", `Bearer ${args.token}`)
          .send(data)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.code).toEqual(10039);
            done();
          });
      });
    });
  });
  describe("GET /groups", () => {
    it("should get all groups", done => {
      request(args.app)
        .get("/groups")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toEqual(5);
          done();
        });
    });
  });
  describe("DELETE /groups/:id", () => {
    it("should delete group", done => {
      request(args.app)
        .delete(`/groups/${args.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Group was successfully deleted.");
          done();
        });
    });

    it("should return an error if group not found", done => {
      request(args.app)
        .delete("/groups/589dcdd38d71fee259dc4e00")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Group not found with id 589dcdd38d71fee259dc4e00");
          done();
        });
    });
  });
  describe("POST /groups/:id/search", () => {
    describe("when calling the search", () => {
      it("should trigger the search for the given group", done => {
        request(args.app)
          .post(`/groups/${args.id}/search`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Search triggered");
            done();
          });
      });
      it("should create a new search entry", done => {
        request(args.app)
          .post(`/groups/${args.id}/search`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const searches = await Search.find({});
            expect(searches.length).toEqual(5);
            done();
          });
      });
    });
    describe("when saving the results", () => {
      beforeEach(async done => {
        const experimentData = new Experiment(experiments.tbUploadMetadataTagged);
        await experimentData.save();
        done();
      });

      it("should tag th experiments in the group", done => {
        request(args.app)
          .put(`/searches/${args.group.search.id}/results`)
          .set("Authorization", `Bearer ${args.token}`)
          .send(searches.results.sequence)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body).toHaveProperty("data");
            const group = await Group.get(args.id);
            expect(group.experiments.length).toEqual(1);
            expect(group.experiments[0].metadata.sample.isolateId).toEqual("ERR017683");
            done();
          });
      });
    });
  });
  describe("POST /groups/search", () => {
    it("should trigger the search for all the groups", done => {
      request(args.app)
        .post(`/groups/search`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Search triggered");
          done();
        });
    });
    it("should create a new search entries", done => {
      request(args.app)
        .post(`/groups/search`)
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          const count = await Search.count({});
          expect(count).toEqual(5);
          done();
        });
    });
  });
});
