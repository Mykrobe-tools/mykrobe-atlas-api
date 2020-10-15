import Constants from "../../src/server/Constants";

import Group from "../../src/server/models/group.model";

import groups from "../fixtures/groups/default";

import setup from "../setup";

let id = null;

beforeEach(async done => {
  const groupData = new Group(groups.medoza);
  const savedGroup = await groupData.save();
  id = groupData.id;
  done();
});

afterEach(async () => {
  await Group.deleteMany({});
});

describe("## Groups Functions", () => {
  describe("#save", () => {
    describe("when data is valid", () => {
      it("should save the group", async done => {
        const groupData = new Group(groups.salta);
        const savedGroup = await groupData.save();
        expect(savedGroup.name).toEqual("Salta Group");
        done();
      });
    });
  });
  describe("#get", () => {
    describe("when the group exists", () => {
      it("should return the group", async done => {
        const foundGroup = await Group.get(id);
        expect(foundGroup.name).toEqual("Mendoza Group");
        done();
      });
    });
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
  describe("#toJSON", () => {
    it("return core group details", async done => {
      const foundGroup = await Group.get(id);
      const json = foundGroup.toJSON();
      expect(json.name).toEqual("Mendoza Group");
      done();
    });
  });
  describe("#list", () => {
    describe("when groups exist", () => {
      it("should return all groups", async done => {
        const groups = await Group.list();
        expect(groups.length).toEqual(1);
        expect(groups[0].name).toEqual("Mendoza Group");
        expect(groups[0].searchHash).toEqual("dc7a0dc4b8ec545fd8c02034302034c5");
        done();
      });
    });
    describe("when no groups exist", () => {
      beforeEach(async () => {
        await Group.deleteMany({});
      });
      it("should return an empty array", async done => {
        const groups = await Group.list();
        expect(groups.length).toEqual(0);
        expect(groups).toEqual([]);
        done();
      });
    });
  });
});
