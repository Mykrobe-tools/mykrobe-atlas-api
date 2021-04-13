import { MongoClient } from "mongodb";
import mongoose from "mongoose";

import Constants from "../Constants";
import AccountsService from "../modules/accounts/AccountsService";

import Member from "./member.model";
import Organisation from "./organisation.model";

import Organisations from "./__fixtures__/Organisations";

const args = {
  id: null,
  client: null,
  organisation: null
};

beforeAll(async done => {
  // db: Use in-memory db for tests
  args.client = await MongoClient.connect(global.__MONGO_URI__, {});
  await args.client.db(global.__MONGO_DB_NAME__);
  await mongoose.connect(global.__MONGO_URI__, {});

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
jest.mock("makeandship-api-common/lib/modules/accounts/AccountsService");
AccountsService.mockImplementation(() => ({
  __esModule: true,
  default: jest.fn()
}));
// , () => {
//   return {
//     __esModule: true,
//     default: jest.fn().mockImplementation(() => {
//       return {
//         middleware: {
//           protect: jest.fn().mockImplementation(() => {
//             return (req, res, next) => {
//               next();
//             };
//           }),
//           express: jest.fn().mockImplementation(() => {
//             return (req, res, next) => {
//               next();
//             };
//           }),
//           getUser: jest.fn().mockImplementation(() => {
//             return (req, res, next) => {
//               req.user = {
//                 id: "c1fb8f2b-0963-4656-a3ef-fc08fb9f9df6"
//               };
//               next();
//             };
//           })
//         },
//         groupExists: jest.fn().mockReturnValue(true),
//         createGroup: jest.fn().mockReturnValue({ id: "" }),
//         getGroup: jest.fn().mockReturnValue({ id: "" }),
//         addRoleToGroup: jest.fn()
//       };
//     })
//   };
// });

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
      it.only("should create an owner group", async done => {
        const organisationData = new Organisation(Organisations.valid.diagnostics);
        const savedOrganisation = await organisationData.save();
        expect(savedOrganisation.name).toEqual("Diagnostic systems");

        console.log(AccountsService.mock.instances);

        done();
      });
      it("should create a member group", async done => {
        const organisationData = new Organisation(Organisations.valid.diagnostics);
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
