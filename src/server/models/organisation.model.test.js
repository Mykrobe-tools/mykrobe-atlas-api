import { MongoClient } from "mongodb";
import mongoose from "mongoose";

import Constants from "../Constants";
import AccountsService from "makeandship-api-common/lib/modules/accounts/AccountsService";

import Member from "./member.model";
import Organisation from "./organisation.model";

import Organisations from "./__fixtures__/Organisations";

const args = {
  id: null,
  client: null,
  organisation: null,
  mockGroupExists: jest.fn().mockReturnValue(true),
  mockCreateGroup: jest.fn().mockReturnValue({ id: "" }),
  mockGetGroup: jest.fn().mockReturnValue({ id: "" }),
  mockAddRoleToGroup: jest.fn()
};

beforeAll(async done => {
  // db: Use in-memory db for tests
  args.client = await MongoClient.connect(global.__MONGO_URI__, {});
  await args.client.db(global.__MONGO_DB_NAME__);
  await mongoose.connect(global.__MONGO_URI__, {});

  // use beforeAll to setup the mock functions so they can be interrogated by tests
  AccountsService.mockImplementation(() => ({
    middleware: {},
    groupExists: args.mockGroupExists,
    createGroup: args.mockCreateGroup,
    getGroup: args.mockGetGroup,
    addRoleToGroup: args.mockAddRoleToGroup
  }));

  done();
});

beforeEach(async done => {
  const organisationData = new Organisation(Organisations.valid.apex);
  args.organisation = await organisationData.save();
  args.id = args.organisation.id;
  done();
});

afterEach(async () => {
  await Organisation.deleteMany({});
});

// mock keycloak calls as invitation has organisation and organisations have
// keycloak groups
jest.mock("makeandship-api-common/lib/modules/accounts/AccountsService", () => jest.fn());

describe("Organisation", () => {
  describe("#save", () => {
    describe("when valid", () => {
      it("should save the organisation", async done => {
        const organisationData = new Organisation(Organisations.valid.diagnostics);
        const savedOrganisation = await organisationData.save();
        expect(savedOrganisation.name).toEqual("Diagnostic systems");
        expect(savedOrganisation.slug).toEqual("diagnostic-systems");

        done();
      });
      it("should check an owner group exists", async done => {
        args.mockGroupExists.mockClear();
        const organisationData = new Organisation(Organisations.valid.diagnostics);
        const savedOrganisation = await organisationData.save();

        expect(args.mockGroupExists).toHaveBeenCalledTimes(2);
        expect(args.mockGroupExists).toHaveBeenCalledTimes(2);
        const names = args.mockGroupExists.mock.calls.map(item => item[0]);
        expect(names.includes("diagnostic-systems-owners")).toEqual(true);
        done();
      });
      it("should check a member group exists", async done => {
        args.mockGroupExists.mockClear();
        const organisationData = new Organisation(Organisations.valid.diagnostics);
        const savedOrganisation = await organisationData.save();

        expect(args.mockGroupExists).toHaveBeenCalledTimes(2);
        const names = args.mockGroupExists.mock.calls.map(item => item[0]);

        expect(names.includes("diagnostic-systems-members")).toEqual(true);
        done();
      });
      describe("when an owner group exists", () => {
        it("should not create an owner group", async done => {
          args.mockCreateGroup.mockClear();
          args.mockGroupExists = jest.fn().mockReturnValue(true);
          const organisationData = new Organisation(Organisations.valid.diagnostics);
          const savedOrganisation = await organisationData.save();

          expect(args.mockCreateGroup).toHaveBeenCalledTimes(0);

          done();
        });
      });
      describe("when an owner group does not exist", () => {
        it("should create an owner group", async done => {
          args.mockCreateGroup.mockClear();
          args.mockGroupExists = jest.fn().mockReturnValue(false);
          const organisationData = new Organisation(Organisations.valid.diagnostics);
          const savedOrganisation = await organisationData.save();

          expect(args.mockCreateGroup).toHaveBeenCalledTimes(2);
          const names = args.mockCreateGroup.mock.calls.map(item => item[0]);

          expect(names.includes("diagnostic-systems-owners")).toEqual(true);

          done();
        });
      });
      describe("when an member group exists", () => {
        it("should not create a member group", async done => {
          args.mockCreateGroup.mockClear();
          args.mockGroupExists = jest.fn().mockReturnValue(true);
          const organisationData = new Organisation(Organisations.valid.diagnostics);
          const savedOrganisation = await organisationData.save();

          expect(args.mockCreateGroup).toHaveBeenCalledTimes(0);

          done();
        });
      });
      describe("when an member group does not exist", () => {
        it("should create an member group", async done => {
          args.mockCreateGroup.mockClear();
          args.mockGroupExists = jest.fn().mockReturnValue(false);
          const organisationData = new Organisation(Organisations.valid.diagnostics);
          const savedOrganisation = await organisationData.save();

          expect(args.mockCreateGroup).toHaveBeenCalledTimes(2);
          const names = args.mockCreateGroup.mock.calls.map(item => item[0]);

          expect(names.includes("diagnostic-systems-members")).toEqual(true);

          done();
        });
      });
    });
  });
  describe("#get", () => {
    describe("when the organisation exists", () => {
      it("should return the organisation", async done => {
        const foundOrganisation = await Organisation.get(args.id);
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
      const foundOrganisation = await Organisation.get(args.id);
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
