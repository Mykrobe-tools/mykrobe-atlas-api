import { MongoClient } from "mongodb";
import mongoose from "mongoose";

import Organisation from "./organisation.model";
import Invitation from "./invitation.model";

import Invitations from "./__fixtures__/Invitations";
import Organisations from "./__fixtures__/Organisations";

const args = {
  id: null,
  invitation: null,
  organisation: null,
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
  const invitationData = new Invitation(Invitations.valid.accepted);
  const organisationData = new Organisation(Organisations.valid.apex);
  args.organisation = await organisationData.save();
  invitationData.organisation = args.organisation;
  args.invitation = await invitationData.save();

  done();
});

afterEach(async done => {
  await Invitation.deleteMany({});
  await Organisation.deleteMany({});
  done();
});

// mock keycloak calls as invitation has organisation and organisations have
// keycloak groups
jest.mock("makeandship-api-common/lib/modules/accounts/AccountsService", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        middleware: {
          protect: jest.fn().mockImplementation(() => {
            return (req, res, next) => {
              next();
            };
          }),
          express: jest.fn().mockImplementation(() => {
            return (req, res, next) => {
              next();
            };
          }),
          getUser: jest.fn().mockImplementation(() => {
            return (req, res, next) => {
              req.user = {
                id: "c1fb8f2b-0963-4656-a3ef-fc08fb9f9df6"
              };
              next();
            };
          })
        },
        groupExists: jest.fn().mockReturnValue(true),
        createGroup: jest.fn().mockReturnValue({ id: "" }),
        getGroup: jest.fn().mockReturnValue({ id: "" }),
        addRoleToGroup: jest.fn()
      };
    })
  };
});

describe("Invitation", () => {
  describe("#save", () => {
    describe("with valid data", () => {
      it("should save the invitation", async done => {
        expect(args.invitation.status).toEqual("Accepted");

        done();
      });

      it("should save the invitation against the organisation", async done => {
        const invitationOrganisation = args.invitation.organisation;
        expect(invitationOrganisation.name).toEqual("Apex Entertainment");
        expect(invitationOrganisation.slug).toEqual("apex-entertainment");

        done();
      });
    });
  });
  describe("#get", () => {
    describe("when the invitation id exists", () => {
      it("should return the invitation", async done => {
        const match = await Invitation.get(args.invitation.id);
        expect(match).toBeTruthy();
        done();
      });
      it("should populate the embedded organisation", async done => {
        const match = await Invitation.get(args.invitation.id);

        const invitationOrganisation = match.organisation;
        expect(invitationOrganisation.name).toEqual("Apex Entertainment");
        expect(invitationOrganisation.slug).toEqual("apex-entertainment");

        done();
      });
    });
    describe("when the invitation does not exist", () => {
      it("should throw an exception", async done => {
        try {
          const match = await Invitation.get("5fdb395ccbb5c222f2aec1bb");
        } catch (e) {
          expect(e.message).toEqual("Invitation not found with id 5fdb395ccbb5c222f2aec1bb");
          done();
        }
      });
    });
  });
  describe("#list", () => {
    it("should list all the invitations", async done => {
      const list = await Invitation.list();
      expect(list.length).toEqual(1);
      done();
    });
  });
  describe("#toJSON", () => {
    it("return core invitation details", async done => {
      const foundInvitation = await Invitation.get(args.invitation.id);
      const json = foundInvitation.toJSON();
      expect(json.status).toEqual("Accepted");
      done();
    });
  });
});
