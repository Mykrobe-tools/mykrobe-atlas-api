import Organisation from "../../src/server/models/organisation.model";

import setup from "../setup";

import organisations from "../fixtures/organisations";

let id = null;

beforeEach(async done => {
  const organisationData = new Organisation(organisations.apex);
  const savedOrganisation = await organisationData.save();
  id = savedOrganisation.id;
  done();
});

afterEach(done => {
  Organisation.remove({}, done);
});

describe("## Organisations Functions", () => {
  describe("#save", () => {
    describe("when data is valid", () => {
      it("should save the organisation", async done => {
        const organisationData = new Organisation(organisations.diagnostics);
        const savedOrganisation = await organisationData.save();
        expect(savedOrganisation.name).toEqual("Diagnostic systems");
        done();
      });
    });
  });
  describe("#get", () => {
    describe("when the organisation exists", () => {
      it("should return the organisation", async done => {
        const foundOrganisation = await Organisation.get(id);
        expect(foundOrganisation.name).toEqual("Apex Entertainment");
        done();
      });
    });
    describe("when the organisation does not exist", () => {
      it("should return an error message", async done => {
        try {
          await Organisation.get("58d3f3795d34d121805fdc61");
          fail();
        } catch (e) {
          expect(e.name).toEqual("ObjectNotFound");
          expect(e.message).toEqual("Organisation not found with id 58d3f3795d34d121805fdc61");
          done();
        }
      });
    });
  });
  describe("#toJSON", () => {
    it("return core organisation details", async done => {
      const foundOrganisation = await Organisation.get(id);
      const json = foundOrganisation.toJSON();
      expect(json.name).toEqual("Apex Entertainment");
      done();
    });
  });
  describe("#list", () => {
    describe("when organisations exist", () => {
      it("should return all organisations", async done => {
        const organisations = await Organisation.list();
        expect(organisations.length).toEqual(1);
        expect(organisations[0].name).toEqual("Apex Entertainment");
        done();
      });
    });
    describe("when no organisations exist", () => {
      beforeEach(done => {
        Organisation.remove({}, done);
      });
      it("should return an empty array", async done => {
        const organisations = await Organisation.list();
        expect(organisations.length).toEqual(0);
        expect(organisations).toEqual([]);
        done();
      });
    });
  });
});
