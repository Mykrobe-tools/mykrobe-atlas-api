import request from "supertest";
import httpStatus from "http-status";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Organisation from "../../src/server/models/organisation.model";
import Member from "../../src/server/models/member.model";
import OrganisationHelper from "../../src/server/helpers/OrganisationHelper";

import Constants from "../../src/server/Constants";

import users from "../fixtures/users";
import organisations from "../fixtures/organisations";

jest.mock("../../src/server/modules/mandrill/MandrillService");

const args = {
  app: null,
  token: null,
  id: null,
  organisation: null,
  user: null
};

beforeAll(async () => {
  args.app = await createApp();
});

beforeEach(async done => {
  const userData = new User(users.admin);
  const organisationData = new Organisation(organisations.apex);
  args.user = await userData.save();
  request(args.app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end(async (err, res) => {
      args.token = res.body.data.access_token;
      args.organisation = await organisationData.save();
      args.id = args.organisation.id;
      done();
    });
});

afterEach(async done => {
  await User.deleteMany({});
  await Organisation.deleteMany({});
  await Member.deleteMany({});
  done();
});

describe("OrganisationController", () => {
  describe("POST /organisations", () => {
    describe("when valid", () => {
      it("should create a new organisation", done => {
        request(args.app)
          .post("/organisations")
          .set("Authorization", `Bearer ${args.token}`)
          .send({ name: "Make and Ship" })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.name).toEqual("Make and Ship");
            expect(res.body.data.slug).toEqual("make-and-ship");
            expect(res.body.data.ownersGroupId).toEqual("46e23392-1773-4ab0-9f54-14eb2200d077");
            done();
          });
      });
    });
    describe("when not valid", () => {
      describe("when the user is not authenticated", () => {
        it("should return an error", done => {
          request(args.app)
            .post("/organisations")
            .set("Authorization", "Bearer INVALID_TOKEN")
            .send({ name: "Make and Ship" })
            .expect(httpStatus.UNAUTHORIZED)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.NOT_ALLOWED);
              expect(res.body.message).toEqual("Not Authorised");
              done();
            });
        });
      });
      describe("when the organisation already exists", () => {
        describe("when the name already exists", () => {
          it("should return an error", done => {
            request(args.app)
              .post("/organisations")
              .set("Authorization", `Bearer ${args.token}`)
              .send({ name: "Make and Ship" })
              .expect(httpStatus.UNAUTHORIZED)
              .end((err, res) => {
                expect(res.body.status).toEqual("success");
                request(args.app)
                  .post("/organisations")
                  .set("Authorization", `Bearer ${args.token}`)
                  .send({ name: "Make and Ship" })
                  .expect(httpStatus.UNAUTHORIZED)
                  .end((err, res) => {
                    expect(res.body.status).toEqual("error");
                    expect(res.body.code).toEqual(Constants.ERRORS.CREATE_ORGANISATION);
                    expect(res.body.data).toHaveProperty("errors");
                    expect(res.body.data.errors).toHaveProperty("name");
                    expect(res.body.data.errors.name).toHaveProperty(
                      "message",
                      "Organisation already exists with name Make and Ship"
                    );
                    done();
                  });
              });
          });
        });
        describe("when the slug already exists", () => {
          it("should return an error", async done => {
            const anotherOrganisation = new Organisation();
            anotherOrganisation.name = "Another organisation";
            anotherOrganisation.slug = "make-and-ship";
            await anotherOrganisation.save();

            request(args.app)
              .post("/organisations")
              .set("Authorization", `Bearer ${args.token}`)
              .send({ name: "Make and Ship" })
              .expect(httpStatus.UNAUTHORIZED)
              .end((err, res) => {
                expect(res.body.status).toEqual("error");
                expect(res.body.code).toEqual(Constants.ERRORS.CREATE_ORGANISATION);
                expect(res.body.data).toHaveProperty("errors");
                expect(res.body.data.errors).toHaveProperty("slug");
                expect(res.body.data.errors.slug).toHaveProperty(
                  "message",
                  "An organisation with slug make-and-ship has been used in the past and cannot be used again"
                );
                done();
              });
          });
        });
      });
    });
  });
  describe("GET /organisations/:id", () => {
    it("should get organisation details", done => {
      request(args.app)
        .get(`/organisations/${args.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.name).toEqual("Apex Entertainment");
          done();
        });
    });

    it("should report error with message - Not found, when organisation does not exists", done => {
      request(args.app)
        .get("/organisations/56c787ccc67fc16ccc1a5e92")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.message).toEqual(
            "Organisation not found with id 56c787ccc67fc16ccc1a5e92"
          );
          done();
        });
    });

    it("should remove unwanted fields", done => {
      request(args.app)
        .get(`/organisations/${args.id}`)
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
        .get(`/organisations/${args.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.id).toEqual(args.id);
          done();
        });
    });
  });
  describe("PUT /organisations/:id", () => {
    it("should update organisation details", done => {
      const data = {
        name: "Make and Ship"
      };
      request(args.app)
        .put(`/organisations/${args.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .send(data)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.name).toEqual("Make and Ship");
          done();
        });
    });
    it("should not update organisation slug", done => {
      const data = {
        name: "Make and Ship"
      };
      request(args.app)
        .put(`/organisations/${args.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .send(data)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.name).toEqual("Make and Ship");
          expect(res.body.data.slug).toEqual("apex-entertainment");
          done();
        });
    });
    describe("when trying to update blacklisted fields", () => {
      beforeEach(async done => {
        const member = await OrganisationHelper.createMember(args.user);
        args.organisation.owners.push(member);
        await args.organisation.save();
        done();
      });
      it("should only update the whitelisted fields", done => {
        const data = {
          owners: [
            {
              userId: "5e1da2eff1bf751cf6d5ba69",
              firstname: "David",
              lastname: "Robin",
              phone: "06734929442",
              username: "admin@nhs.co.uk",
              email: "admin@nhs.co.uk",
              id: "5e1da2eff1bf751cf6d5ba6b"
            }
          ],
          members: [],
          unapprovedMembers: [],
          rejectedMembers: [],
          name: "Make and Ship",
          membersGroupId: "46e23392-1773-4ab0-9f54-14eb2200d077",
          ownersGroupId: "46e23392-1773-4ab0-9f54-14eb2200d077",
          id: "5e1da2eff1bf751cf6d5ba6a"
        };
        request(args.app)
          .put(`/organisations/${args.id}`)
          .set("Authorization", `Bearer ${args.token}`)
          .send(data)
          .expect(httpStatus.OK)
          .end(() => {
            request(args.app)
              .get(`/organisations/${args.id}`)
              .set("Authorization", `Bearer ${args.token}`)
              .expect(httpStatus.OK)
              .end((err, res) => {
                expect(Array.isArray(res.body.data.owners)).toBe(true);
                expect(res.body.data.owners.length).toEqual(1);
                expect(res.body.data.name).toEqual("Make and Ship");
                done();
              });
          });
      });
    });
  });
  describe("GET /organisations", () => {
    it("should get all organisations", done => {
      request(args.app)
        .get("/organisations")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toEqual(1);
          done();
        });
    });
  });
  describe("DELETE /organisations/:id", () => {
    it("should delete organisation", done => {
      request(args.app)
        .delete(`/organisations/${args.id}`)
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Organisation was successfully deleted.");
          done();
        });
    });

    it("should return an error if organisation not found", done => {
      request(args.app)
        .delete("/organisations/589dcdd38d71fee259dc4e00")
        .set("Authorization", `Bearer ${args.token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            "Organisation not found with id 589dcdd38d71fee259dc4e00"
          );
          done();
        });
    });
  });
  describe("POST /organisations/:id/join", () => {
    describe("when the user is not authenticated", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/join`)
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
    describe("when the user is not part of any list", () => {
      it("should add the user to the unapprovedMembers list", done => {
        request(args.app)
          .post(`/organisations/${args.id}/join`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.id).toEqual(args.id);
            expect(res.body.data.unapprovedMembers.length).toEqual(1);
            done();
          });
      });
    });
    describe("when the user is part unapprovedMembers list", () => {
      beforeEach(async done => {
        const member = await OrganisationHelper.createMember(args.user);
        args.organisation.unapprovedMembers.push(member);
        await args.organisation.save();
        done();
      });
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/join`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.code).toEqual(Constants.ERRORS.JOIN_ORGANISATION);
            expect(res.body.message).toEqual("You are already in the unapprovedMembers list");
            done();
          });
      });
      it("should not add the user to the unapprovedMembers", done => {
        request(args.app)
          .post(`/organisations/${args.id}/join`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end(async () => {
            const org = await Organisation.get(args.id);
            expect(org.unapprovedMembers.length).toEqual(1);
            done();
          });
      });
    });
    describe("when the user is part rejectedMembers list", () => {
      beforeEach(async done => {
        const member = await OrganisationHelper.createMember(args.user);
        args.organisation.rejectedMembers.push(member);
        await args.organisation.save();
        done();
      });
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/join`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.code).toEqual(Constants.ERRORS.JOIN_ORGANISATION);
            expect(res.body.message).toEqual("You are already in the rejectedMembers list");
            done();
          });
      });
      it("should not add the user to the unapprovedMembers", done => {
        request(args.app)
          .post(`/organisations/${args.id}/join`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end(async () => {
            const org = await Organisation.get(args.id);
            expect(org.unapprovedMembers.length).toEqual(0);
            done();
          });
      });
    });
    describe("when the user is already a member", () => {
      beforeEach(async done => {
        const member = await OrganisationHelper.createMember(args.user);
        args.organisation.members.push(member);
        await args.organisation.save();
        done();
      });
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/join`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.code).toEqual(Constants.ERRORS.JOIN_ORGANISATION);
            expect(res.body.message).toEqual("You are already in the members list");
            done();
          });
      });
      it("should not add the user to the unapprovedMembers", done => {
        request(args.app)
          .post(`/organisations/${args.id}/join`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end(async () => {
            const org = await Organisation.get(args.id);
            expect(org.unapprovedMembers.length).toEqual(0);
            done();
          });
      });
    });
  });
  describe("POST /organisations/:id/members/:memberId/approve", () => {
    let member = null;
    beforeEach(async done => {
      member = await OrganisationHelper.createMember(args.user);
      done();
    });
    describe("when the user is not authenticated", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/members/${member.id}/approve`)
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
    describe("when the user is not the owner", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/members/${member.id}/approve`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.code).toEqual(Constants.ERRORS.APPROVE_MEMBER);
            expect(res.body.message).toEqual("You are not an owner of this organisation");
            done();
          });
      });
    });
    describe("when the user is the owner", () => {
      beforeEach(async done => {
        args.organisation.owners.push(member);
        await args.organisation.save();
        done();
      });
      describe("when the member is not found in the waiting list", () => {
        it("should return an error", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.APPROVE_MEMBER);
              expect(res.body.message).toEqual(
                "The provided member is not eligible for this operation"
              );
              done();
            });
        });
      });
      describe("when the member is already a member", () => {
        beforeEach(async done => {
          args.organisation.members.push(member);
          await args.organisation.save();
          done();
        });
        it("should return an error", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.APPROVE_MEMBER);
              expect(res.body.message).toEqual("You are already in the members list");
              done();
            });
        });
      });
      describe("when the member is in the unapproved list", () => {
        beforeEach(async done => {
          args.organisation.unapprovedMembers.push(member);
          await args.organisation.save();
          done();
        });
        it("should approve the request", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.id).toEqual(args.id);
              expect(res.body.data.members.length).toEqual(1);
              done();
            });
        });
        it("should return add the member to the members list", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.members.length).toEqual(1);

              const approvedMember = org.members[0];
              expect(approvedMember.id).toEqual(member.id);
              expect(approvedMember.actionedBy.userId).toEqual(args.user.id);
              expect(approvedMember.actionedAt).toBeTruthy();
              expect(approvedMember.action).toEqual("approve");
              done();
            });
        });
        it("should return remove the member from the unapproved list", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.unapprovedMembers.length).toEqual(0);
              done();
            });
        });
      });
      describe("when the member is in the rejected list", () => {
        beforeEach(async done => {
          args.organisation.rejectedMembers.push(member);
          await args.organisation.save();
          done();
        });
        it("should approve the request", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.id).toEqual(args.id);
              expect(res.body.data.members.length).toEqual(1);
              done();
            });
        });
        it("should return add the member to the members list", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.members.length).toEqual(1);

              const approvedMember = org.members[0];
              expect(approvedMember.id).toEqual(member.id);
              expect(approvedMember.actionedBy.userId).toEqual(args.user.id);
              expect(approvedMember.actionedAt).toBeTruthy();
              expect(approvedMember.action).toEqual("approve");
              done();
            });
        });
        it("should return remove the member from the rejected list", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.rejectedMembers.length).toEqual(0);
              done();
            });
        });
      });
    });
  });
  describe("POST /organisations/:id/members/:memberId/reject", () => {
    let member = null;
    beforeEach(async done => {
      member = await OrganisationHelper.createMember(args.user);
      done();
    });
    describe("when the user is not authenticated", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/members/${member.id}/reject`)
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
    describe("when the user is not the owner", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/members/${member.id}/reject`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.code).toEqual(Constants.ERRORS.REJECT_MEMBER);
            expect(res.body.message).toEqual("You are not an owner of this organisation");
            done();
          });
      });
    });
    describe("when the user is the owner", () => {
      beforeEach(async done => {
        args.organisation.owners.push(member);
        await args.organisation.save();
        done();
      });
      describe("when the member is not found in the waiting list", () => {
        it("should return an error", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.REJECT_MEMBER);
              expect(res.body.message).toEqual(
                "The provided member is not eligible for this operation"
              );
              done();
            });
        });
      });
      describe("when the member is already a member", () => {
        beforeEach(async done => {
          args.organisation.members.push(member);
          await args.organisation.save();
          done();
        });
        it("should return an error", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.REJECT_MEMBER);
              expect(res.body.message).toEqual("You are already in the members list");
              done();
            });
        });
      });
      describe("when the member is already a rejected", () => {
        beforeEach(async done => {
          args.organisation.rejectedMembers.push(member);
          await args.organisation.save();
          done();
        });
        it("should return an error", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.REJECT_MEMBER);
              expect(res.body.message).toEqual("You are already in the rejectedMembers list");
              done();
            });
        });
      });
      describe("when the member is in the unapproved list", () => {
        beforeEach(async done => {
          if (!args.organisation.unapprovedMembers) {
            args.organisation.unapprovedMembers = [];
          }
          args.organisation.unapprovedMembers.push(member);
          await args.organisation.save();
          done();
        });
        it("should reject the request", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.id).toEqual(args.id);
              expect(res.body.data.rejectedMembers.length).toEqual(1);
              done();
            });
        });
        it("should return add the member to the members list", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.rejectedMembers.length).toEqual(1);

              const rejectedMember = org.rejectedMembers[0];
              expect(rejectedMember.id).toEqual(member.id);
              expect(rejectedMember.actionedBy.userId).toEqual(args.user.id);
              expect(rejectedMember.actionedAt).toBeTruthy();
              expect(rejectedMember.action).toEqual("reject");
              done();
            });
        });
        it("should return remove the member from the unapproved list", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.unapprovedMembers.length).toEqual(0);
              done();
            });
        });
      });
    });
  });
  describe("POST /organisations/:id/members/:memberId/remove", () => {
    let member = null;
    beforeEach(async done => {
      member = await OrganisationHelper.createMember(args.user);
      done();
    });
    describe("when the user is not authenticated", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/members/${member.id}/remove`)
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
    describe("when the user is not the owner", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/members/${member.id}/remove`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.code).toEqual(Constants.ERRORS.REMOVE_MEMBER);
            expect(res.body.message).toEqual("You are not an owner of this organisation");
            done();
          });
      });
    });
    describe("when the user is the owner", () => {
      beforeEach(async done => {
        args.organisation.owners.push(member);
        await args.organisation.save();
        done();
      });
      describe("when the user is not found in the organisation members", () => {
        it("should return an error", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/remove`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.REMOVE_MEMBER);
              expect(res.body.message).toEqual(
                "The provided member is not eligible for this operation"
              );
              done();
            });
        });
      });
      describe("when the user is in the organisation members", () => {
        beforeEach(async done => {
          args.organisation.members.push(member);
          await args.organisation.save();
          done();
        });
        it("should return a successful response", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/remove`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.id).toEqual(args.id);
              expect(res.body.data.members.length).toEqual(0);
              done();
            });
        });
        it("should return remove the user from the members list", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/remove`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.members.length).toEqual(0);
              done();
            });
        });
      });
    });
  });
  describe("POST /organisations/:id/members/:memberId/promote", () => {
    let member = null;
    beforeEach(async done => {
      member = await OrganisationHelper.createMember(args.user);
      done();
    });
    describe("when the user is not authenticated", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/members/${member.id}/promote`)
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
    describe("when the user is not the owner", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/members/${member.id}/promote`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.code).toEqual(Constants.ERRORS.PROMOTE_MEMBER);
            expect(res.body.message).toEqual("You are not an owner of this organisation");
            done();
          });
      });
    });
    describe("when the user is the owner", () => {
      beforeEach(async done => {
        args.organisation.owners.push(member);
        await args.organisation.save();
        done();
      });
      describe("when the user is not found in the args.organisation members", () => {
        it("should return an error", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/promote`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.PROMOTE_MEMBER);
              expect(res.body.message).toEqual(
                "The provided member is not eligible for this operation"
              );
              done();
            });
        });
      });
      describe("when the user is in the organisation members", () => {
        beforeEach(async done => {
          args.organisation.members.push(member);
          await args.organisation.save();
          done();
        });
        it("should return a successful response", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/promote`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.id).toEqual(args.id);
              expect(res.body.data.owners.length).toEqual(2);
              done();
            });
        });
        it("should remove the user from the members list", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/promote`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.members.length).toEqual(0);
              done();
            });
        });
        it("should add the user to the owners list", done => {
          request(args.app)
            .post(`/organisations/${args.id}/members/${member.id}/promote`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.owners.length).toEqual(2);
              done();
            });
        });
      });
    });
  });
  describe("POST /organisations/:id/owners/:memberId/demote", () => {
    let member = null;
    beforeEach(async done => {
      member = await OrganisationHelper.createMember(args.user);
      done();
    });
    describe("when the user is not authenticated", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/owners/${member.id}/demote`)
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
    describe("when the user is not the owner", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/owners/${member.id}/demote`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.code).toEqual(Constants.ERRORS.DEMOTE_MEMBER);
            expect(res.body.message).toEqual("You are not an owner of this organisation");
            done();
          });
      });
    });
    describe("when the user is the owner", () => {
      describe("when the user is the only owner", () => {
        beforeEach(async done => {
          args.organisation.owners.push(member);
          await args.organisation.save();
          done();
        });
        it("should not leave the owners list empty", done => {
          request(args.app)
            .post(`/organisations/${args.id}/owners/${member.id}/demote`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.code).toEqual(Constants.ERRORS.DEMOTE_MEMBER);
              expect(res.body.message).toEqual("The owners list cannot be empty");
              done();
            });
        });
        it("should keep the owner in the organisation", done => {
          request(args.app)
            .post(`/organisations/${args.id}/owners/${member.id}/demote`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.owners.length).toEqual(1);
              done();
            });
        });
      });
      describe("when there are multiple organisation owners", () => {
        beforeEach(async done => {
          const ownerData = new User(users.thomas);
          const savedOwner = await ownerData.save();
          const secondMember = await OrganisationHelper.createMember(savedOwner);
          args.organisation.owners.push(member);
          args.organisation.owners.push(secondMember);
          await args.organisation.save();
          done();
        });
        it("should return a successful response", done => {
          request(args.app)
            .post(`/organisations/${args.id}/owners/${member.id}/demote`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.id).toEqual(args.id);
              expect(res.body.data.owners.length).toEqual(1);
              done();
            });
        });
        it("should remove the user from the owners list", done => {
          request(args.app)
            .post(`/organisations/${args.id}/owners/${member.id}/demote`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.owners.length).toEqual(1);
              expect(org.owners[0].firstname).toEqual("Thomas");
              done();
            });
        });
        it("should add the user to the members list", done => {
          request(args.app)
            .post(`/organisations/${args.id}/owners/${member.id}/demote`)
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(args.id);
              expect(org.members.length).toEqual(1);
              expect(org.members[0].firstname).toEqual("David");
              done();
            });
        });
      });
    });
  });
  describe("POST /organisations/:id/invite", () => {
    describe("when the user is not authenticated", () => {
      it("should return an error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/invite`)
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
    describe("when the user's email is not provided", () => {
      it("should return a validation error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/invite`)
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Validation failed");
            expect(res.body.data.errors.email.message).toEqual(
              "should have required property 'email'"
            );
            done();
          });
      });
    });
    describe("when the user's email is not valid", () => {
      it("should return a validation error", done => {
        request(args.app)
          .post(`/organisations/${args.id}/invite`)
          .set("Authorization", `Bearer ${args.token}`)
          .send({ email: "sam@mykro" })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Validation failed");
            expect(res.body.data.errors.email.message).toEqual('should match format "email"');
            done();
          });
      });
    });
    describe("when the user is not an owner", () => {
      it("should return an error message", done => {
        request(args.app)
          .post(`/organisations/${args.id}/invite`)
          .set("Authorization", `Bearer ${args.token}`)
          .send({ email: "sam@mykro.be" })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("You are not an owner of this organisation");
            done();
          });
      });
    });
    describe("when the user is an owner", () => {
      beforeEach(async done => {
        const member = await OrganisationHelper.createMember(args.user);
        args.organisation.owners.push(member);
        const saved = await args.organisation.save();
        done();
      });
      describe("when the user is not registered", () => {
        it("should send a registration email", done => {
          request(args.app)
            .post(`/organisations/${args.id}/invite`)
            .set("Authorization", `Bearer ${args.token}`)
            .send({ email: "sam@mykro.be" })
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data).toEqual("Registration link sent to sam@mykro.be");
              done();
            });
        });
      });
      describe("when the user is registered", () => {
        it("should send an invitation email", done => {
          request(args.app)
            .post(`/organisations/${args.id}/invite`)
            .set("Authorization", `Bearer ${args.token}`)
            .send({ email: "admin@nhs.co.uk" })
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data).toEqual("Invitation link sent to admin@nhs.co.uk");
              done();
            });
        });
      });
      describe("when the user is registered and already invited", () => {
        beforeEach(async done => {
          request(args.app)
            .post(`/organisations/${args.id}/invite`)
            .set("Authorization", `Bearer ${args.token}`)
            .send({ email: "admin@nhs.co.uk" })
            .expect(httpStatus.OK)
            .end(() => {
              done();
            });
        });
        it("should not send the invitation multiple times", done => {
          request(args.app)
            .post(`/organisations/${args.id}/invite`)
            .set("Authorization", `Bearer ${args.token}`)
            .send({ email: "admin@nhs.co.uk" })
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data).toEqual(
                "This email has already been invited to Apex Entertainment"
              );
              done();
            });
        });
        it("should make the invitations available in /user", done => {
          request(args.app)
            .get(`/user`)
            .set("Authorization", `Bearer ${args.token}`)
            .send({ email: "admin@nhs.co.uk" })
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");

              const { invitations } = res.body.data;
              expect(invitations.length).toEqual(1);
              expect(invitations[0].status).toEqual("Pending");
              expect(invitations[0].organisation.name).toEqual("Apex Entertainment");
              done();
            });
        });
      });
    });
  });
});
