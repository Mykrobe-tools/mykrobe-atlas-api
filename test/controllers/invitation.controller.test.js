import request from "supertest";
import httpStatus from "http-status";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Organisation from "../../src/server/models/organisation.model";
import Member from "../../src/server/models/member.model";
import Invitation from "../../src/server/models/invitation.model";
import Experiment from "../../src/server/models/experiment.model";
import OrganisationHelper from "../../src/server/helpers/OrganisationHelper";

import Constants from "../../src/server/Constants";

import users from "../fixtures/users";
import organisations from "../fixtures/organisations";
import experiments from "../fixtures/experiments";

const args = {
  app: null,
  token: null,
  organisation: null,
  userOrganisation: null,
  invitation: null,
  user: null
};

beforeAll(async () => {
  args.app = await createApp();
});

beforeEach(async done => {
  const userData = new User(users.admin);
  const organisationData = new Organisation(organisations.apex);
  const userOrganisationData = new Organisation(organisations.diagnostics);
  args.userOrganisation = await userOrganisationData.save();
  const invitationData = new Invitation({ status: Constants.INVITATION_STATUS.PENDING });
  args.organisation = await organisationData.save();
  invitationData.organisation = args.organisation;
  args.invitation = await invitationData.save();
  userData.invitations.push(args.invitation);
  userData.organisation = args.userOrganisation;
  args.user = await userData.save();
  request(args.app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end(async (err, res) => {
      args.token = res.body.data.access_token;
      done();
    });
});

afterEach(async done => {
  await User.deleteMany({});
  await Organisation.deleteMany({});
  await Member.deleteMany({});
  await Invitation.deleteMany({});
  await Experiment.deleteMany({});
  done();
});

describe("InvitationController", () => {
  describe("PUT /invitations/{id}/accept", () => {
    describe("when invalid", () => {
      describe("when the user is not authenticated", () => {
        it("should return an error", done => {
          request(args.app)
            .put(`/invitations/${args.invitation.id}/accept`)
            .set("Authorization", "Bearer INVALID_TOKEN")
            .expect(httpStatus.UNAUTHORIZED)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.NOT_ALLOWED);
              expect(res.body.message).toEqual("Not Authorised");
              done();
            });
        });
      });
      describe("when the invitation doesnt exist", () => {
        it("should return an error", done => {
          request(args.app)
            .put("/invitations/56c787ccc67fc16ccc1a5e92/accept")
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.GET_INVITATION);
              expect(res.body.message).toEqual("No pending invitation with the provided id");
              done();
            });
        });
      });
      describe("when the invitation is not pending", () => {
        beforeEach(async done => {
          args.invitation.status = Constants.INVITATION_STATUS.ACCEPTED;
          await args.invitation.save();
          done();
        });
        it("should return an error", done => {
          request(args.app)
            .put(`/invitations/${args.invitation.id}/accept`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.GET_INVITATION);
              expect(res.body.message).toEqual("No pending invitation with the provided id");
              done();
            });
        });
      });
    });
    describe("when valid", () => {
      let data, status;
      beforeEach(async done => {
        request(args.app)
          .put(`/invitations/${args.invitation.id}/accept`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            data = res.body.data;
            status = res.body.status;
            done();
          });
      });
      it("should return success", () => {
        expect(status).toEqual("success");
      });
      it("should update the status to accepted", () => {
        expect(data.status).toEqual(Constants.INVITATION_STATUS.ACCEPTED);
      });
      it("should update the organisation members", async () => {
        const { members } = await Organisation.get(args.organisation.id);
        expect(members.length).toEqual(1);
        expect(members[0].userId).toEqual(args.user.id);
        expect(members[0].email).toEqual("admin@nhs.co.uk");
      });
      describe("when user organisation is empty", () => {
        it("should clear the user organisation", async () => {
          const user = await User.findByEmail("admin@nhs.co.uk");
          expect(user.organisation).toBeFalsy();
        });
        it("should delete the user organisation", async () => {
          const orgList = await Organisation.list();
          expect(orgList.length).toEqual(1);
          expect(orgList[0].name).toEqual("Apex Entertainment");
        });
      });
    });
    describe("when user organisation has members", () => {
      beforeEach(async done => {
        const userData = new User(users.neil);
        const savedUser = await userData.save();
        const member = await OrganisationHelper.getOrCreateMember(savedUser);
        const userOrg = args.userOrganisation;
        userOrg.members.push(member);
        const savedOrg = await userOrg.save();
        request(args.app)
          .put(`/invitations/${args.invitation.id}/accept`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            done();
          });
      });
      it("should not clear the user organisation", async () => {
        const user = await User.findByEmail("admin@nhs.co.uk");
        expect(user.organisation).toBeTruthy();
      });
      it("should not delete the user organisation", async () => {
        const orgList = await Organisation.list();
        expect(orgList.length).toEqual(2);
      });
    });
    describe("when user organisation has experiments", () => {
      beforeEach(async done => {
        const experimentData = new Experiment(experiments.tbUpload);
        experimentData.organisation = args.userOrganisation;
        const savedExperiment = await experimentData.save();
        request(args.app)
          .put(`/invitations/${args.invitation.id}/accept`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            done();
          });
      });
      it("should not clear the user organisation", async () => {
        const user = await User.findByEmail("admin@nhs.co.uk");
        expect(user.organisation).toBeTruthy();
      });
      it("should not delete the user organisation", async () => {
        const orgList = await Organisation.list();
        expect(orgList.length).toEqual(2);
      });
    });
  });
  describe("PUT /invitations/{id}/reject", () => {
    describe("when invalid", () => {
      describe("when the user is not authenticated", () => {
        it("should return an error", done => {
          request(args.app)
            .put(`/invitations/${args.invitation.id}/reject`)
            .set("Authorization", "Bearer INVALID_TOKEN")
            .expect(httpStatus.UNAUTHORIZED)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.NOT_ALLOWED);
              expect(res.body.message).toEqual("Not Authorised");
              done();
            });
        });
      });
      describe("when the invitation doesnt exist", () => {
        it("should return an error", done => {
          request(args.app)
            .put("/invitations/56c787ccc67fc16ccc1a5e92/reject")
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.GET_INVITATION);
              expect(res.body.message).toEqual("No pending invitation with the provided id");
              done();
            });
        });
      });
      describe("when the invitation is not pending", () => {
        beforeEach(async done => {
          args.invitation.status = Constants.INVITATION_STATUS.ACCEPTED;
          await args.invitation.save();
          done();
        });
        it("should return an error", done => {
          request(args.app)
            .put(`/invitations/${args.invitation.id}/reject`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.GET_INVITATION);
              expect(res.body.message).toEqual("No pending invitation with the provided id");
              done();
            });
        });
      });
    });
    describe("when valid", () => {
      let data, status;
      beforeEach(async done => {
        request(args.app)
          .put(`/invitations/${args.invitation.id}/reject`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            data = res.body.data;
            status = res.body.status;
            done();
          });
      });
      it("should return success", () => {
        expect(status).toEqual("success");
      });
      it("should update the status to declined", () => {
        expect(data.status).toEqual(Constants.INVITATION_STATUS.DECLINED);
      });
      it("should not add the member", async () => {
        const { members } = await Organisation.get(args.organisation.id);
        expect(members.length).toEqual(0);
      });
    });
  });
});
