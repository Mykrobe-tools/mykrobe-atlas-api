import Invitation from "../../src/server/models/invitation.model";
import Organisation from "../../src/server/models/organisation.model";

import setup from "../setup";

import invitations from "../fixtures/invitations";
import organisations from "../fixtures/organisations";

describe("Invitation", () => {
  let invitation,
    organisation = null;
  beforeEach(async done => {
    const invitationData = new Invitation(invitations.accepted);
    const organisationData = new Organisation(organisations.apex);
    organisation = await organisationData.save();
    invitationData.organisation = organisation;
    invitation = await invitationData.save();

    done();
  });
  afterEach(async done => {
    await Invitation.deleteMany({});
    await Organisation.deleteMany({});
    done();
  });

  describe("#save", () => {
    describe("with valid data", () => {
      it("should save the invitation", async done => {
        expect(invitation.status).toEqual("Accepted");

        done();
      });

      it("should save the invitation against the organisation", async done => {
        const invitationOrganisation = invitation.organisation;
        expect(invitationOrganisation.name).toEqual("Apex Entertainment");
        expect(invitationOrganisation.slug).toEqual("apex-entertainment");

        done();
      });
    });
  });
  describe("#get", () => {
    describe("when the invitation id exists", () => {
      it("should return the invitation", async done => {
        const match = await Invitation.get(invitation.id);
        expect(match).toBeTruthy();
        done();
      });
      it("should populate the embedded organisation", async done => {
        const match = await Invitation.get(invitation.id);

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
      const foundInvitation = await Invitation.get(invitation.id);
      const json = foundInvitation.toJSON();
      expect(json.status).toEqual("Accepted");
      done();
    });
  });
});
