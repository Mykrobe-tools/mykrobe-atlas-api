import Constants from "../../src/server/Constants";

import Organisation from "../../src/server/models/organisation.model";

import organisations from "../fixtures/organisations";

import setup from "../setup";

let id = null;

beforeEach(async done => {
  const organisationData = new Organisation(organisations.apex);
  const savedOrganisation = await organisationData.save();
  id = savedOrganisation.id;
  done();
});

afterEach(async () => {
  await Organisation.deleteMany({});
});

describe("## Organisations Functions", () => {
  describe("#save", () => {
    describe("when data is valid", () => {
      it("should save the organisation", async done => {
        const organisationData = new Organisation(organisations.diagnostics);
        const savedOrganisation = await organisationData.save();
        expect(savedOrganisation.name).toEqual("Diagnostic systems");
        expect(savedOrganisation.slug).toEqual("diagnostic-systems");
        done();
      });
    });
  });
  describe("#get", () => {
    describe("when the organisation exists", () => {
      it("should return the organisation", async done => {
        const foundOrganisation = await Organisation.get(id);
        expect(foundOrganisation.name).toEqual("Apex Entertainment");
        expect(foundOrganisation.slug).toEqual("apex-entertainment");
        done();
      });
    });
    describe("when the organisation does not exist", () => {
      it("should return an error message", async done => {
        try {
          await Organisation.get("58d3f3795d34d121805fdc61");
          fail();
        } catch (e) {
          expect(e.code).toEqual(Constants.ERRORS.GET_ORGANISATION);
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
      expect(json.slug).toEqual("apex-entertainment");
      done();
    });
  });
  describe("#list", () => {
    describe("when organisations exist", () => {
      it("should return all organisations", async done => {
        const organisations = await Organisation.list();
        expect(organisations.length).toEqual(1);
        expect(organisations[0].name).toEqual("Apex Entertainment");
        expect(organisations[0].slug).toEqual("apex-entertainment");
        done();
      });
    });
    describe("when no organisations exist", () => {
      beforeEach(async () => {
        await Organisation.deleteMany({});
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
