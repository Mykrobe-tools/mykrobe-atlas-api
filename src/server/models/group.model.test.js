import { MongoClient } from "mongodb";
import mongoose from "mongoose";

import Constants from "../Constants";

import Experiment from "./experiment.model"; // required to register dependent schema
import Search from "./search.model"; // required to register dependent schema
import Group from "./group.model";

import Groups from "./__fixtures__/Groups";

const args = {
  id: null,
  group: null,
  client: null
};

beforeAll(async done => {
  // db: Use in-memory db for tests
  args.client = await MongoClient.connect(global.__MONGO_URI__, {});
  await args.client.db(global.__MONGO_DB_NAME__);
  await mongoose.connect(global.__MONGO_URI__, {});

  done();
});

beforeEach(async done => {
  const groupData = new Group(Groups.valid.medoza);
  args.group = await groupData.save();
  args.id = args.group.id;
  done();
});

afterEach(async () => {
  await Group.deleteMany({});
});

describe("Group", () => {
  describe("#save", () => {
    describe("when valid", () => {
      it("should save the group", async done => {
        const groupData = new Group(Groups.valid.salta);
        const savedGroup = await groupData.save();
        expect(savedGroup.name).toEqual("Salta Group");
        done();
      });
    });
  });
  describe("#get", () => {
    describe("when valid", () => {
      describe("when the group exists", () => {
        it("should return the group", async done => {
          const foundGroup = await Group.get(args.id);
          expect(foundGroup.name).toEqual("Mendoza Group");
          done();
        });
      });
    });
    describe("when not valid", () => {
      describe("when the group does not exist", () => {
        it("should return an error message", async done => {
          try {
            await Group.get("58d3f3795d34d121805fdc61");
            fail();
          } catch (e) {
            expect(e.code).toEqual(Constants.ERRORS.GET_GROUP);
            expect(e.message).toEqual("Group not found with id 58d3f3795d34d121805fdc61");
            done();
          }
        });
      });
    });
  });
  describe("#toJSON", () => {
    describe("when valid", () => {
      it("return core group details", async done => {
        const foundGroup = await Group.get(args.id);
        const json = foundGroup.toJSON();
        expect(json.name).toEqual("Mendoza Group");
        done();
      });
    });
  });
  describe("#list", () => {
    describe("when valid", () => {
      describe("when groups exist", () => {
        it("should return all groups", async done => {
          const groups = await Group.list();
          expect(groups.length).toEqual(1);
          expect(groups[0].name).toEqual("Mendoza Group");
          done();
        });
      });
    });
    describe("when not valid", () => {
      describe("when no groups exist", () => {
        it("should return an empty array", async done => {
          await Group.deleteMany({});

          const groups = await Group.list();
          expect(groups.length).toEqual(0);
          expect(groups).toEqual([]);
          done();
        });
      });
    });
  });
});
