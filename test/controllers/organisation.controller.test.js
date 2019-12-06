import request from "supertest";
import httpStatus from "http-status";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Organisation from "../../src/server/models/organisation.model";
import Member from "../../src/server/models/member.model";
import OrganisationHelper from "../../src/server/helpers/OrganisationHelper";

const app = createApp();

const users = require("../fixtures/users");
const organisations = require("../fixtures/organisations");

let token = null;
let id = null;
let organisation = null;
let user = null;

beforeEach(async done => {
  const userData = new User(users.admin);
  const organisationData = new Organisation(organisations.apex);
  user = await userData.save();
  request(app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end(async (err, res) => {
      token = res.body.data.access_token;
      organisation = await organisationData.save();
      id = organisation.id;
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
  describe("# POST /organisations", () => {
    it("should create a new organisation", done => {
      request(app)
        .post("/organisations")
        .set("Authorization", `Bearer ${token}`)
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

    it("should work only for authenticated users", done => {
      request(app)
        .post("/organisations")
        .set("Authorization", "Bearer INVALID_TOKEN")
        .send({ name: "Make and Ship" })
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
  });

  describe("# GET /organisations/:id", () => {
    it("should get organisation details", done => {
      request(app)
        .get(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.name).toEqual("Apex Entertainment");
          done();
        });
    });

    it("should report error with message - Not found, when organisation does not exists", done => {
      request(app)
        .get("/organisations/56c787ccc67fc16ccc1a5e92")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.message).toEqual(
            "Organisation not found with id 56c787ccc67fc16ccc1a5e92"
          );
          done();
        });
    });

    it("should remove unwanted fields", done => {
      request(app)
        .get(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data._id).toBeUndefined();
          expect(res.body.data.__v).toBeUndefined();
          done();
        });
    });

    it("should add virtual fields", done => {
      request(app)
        .get(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.id).toEqual(id);
          done();
        });
    });
  });

  describe("# PUT /organisations/:id", () => {
    it("should update organisation details", done => {
      const data = {
        name: "Make and Ship"
      };
      request(app)
        .put(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
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
      request(app)
        .put(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(data)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.name).toEqual("Make and Ship");
          expect(res.body.data.slug).toEqual("apex-entertainment");
          done();
        });
    });
  });

  describe("# GET /organisations", () => {
    it("should get all organisations", done => {
      request(app)
        .get("/organisations")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toEqual(1);
          done();
        });
    });
  });

  describe("# DELETE /organisations/:id", () => {
    it("should delete organisation", done => {
      request(app)
        .delete(`/organisations/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Organisation was successfully deleted.");
          done();
        });
    });

    it("should return an error if organisation not found", done => {
      request(app)
        .delete("/organisations/589dcdd38d71fee259dc4e00")
        .set("Authorization", `Bearer ${token}`)
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

  describe("# POST /organisations/:id/join", () => {
    describe("when the user is not authenticated", () => {
      it("should return an error", done => {
        request(app)
          .post(`/organisations/${id}/join`)
          .set("Authorization", "Bearer INVALID_TOKEN")
          .expect(httpStatus.UNAUTHORIZED)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Not Authorised");
            done();
          });
      });
    });
    describe("when the user is not part of any list", () => {
      it("should add the user to the unapprovedMembers list", done => {
        request(app)
          .post(`/organisations/${id}/join`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Request sent, waiting for approval.");
            done();
          });
      });
    });
    describe("when the user is part unapprovedMembers list", () => {
      beforeEach(async done => {
        const member = await OrganisationHelper.createMember(user);
        organisation.unapprovedMembers.push(member);
        await organisation.save();
        done();
      });
      it("should return an error", done => {
        request(app)
          .post(`/organisations/${id}/join`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.data).toEqual("You are already in the unapprovedMembers list");
            done();
          });
      });
      it("should not add the user to the unapprovedMembers", done => {
        request(app)
          .post(`/organisations/${id}/join`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async () => {
            const org = await Organisation.get(id);
            expect(org.unapprovedMembers.length).toEqual(1);
            done();
          });
      });
    });
    describe("when the user is part rejectedMembers list", () => {
      beforeEach(async done => {
        const member = await OrganisationHelper.createMember(user);
        organisation.rejectedMembers.push(member);
        await organisation.save();
        done();
      });
      it("should return an error", done => {
        request(app)
          .post(`/organisations/${id}/join`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.data).toEqual("You are already in the rejectedMembers list");
            done();
          });
      });
      it("should not add the user to the unapprovedMembers", done => {
        request(app)
          .post(`/organisations/${id}/join`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async () => {
            const org = await Organisation.get(id);
            expect(org.unapprovedMembers.length).toEqual(0);
            done();
          });
      });
    });
    describe("when the user is already a member", () => {
      beforeEach(async done => {
        const member = await OrganisationHelper.createMember(user);
        organisation.members.push(member);
        await organisation.save();
        done();
      });
      it("should return an error", done => {
        request(app)
          .post(`/organisations/${id}/join`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.data).toEqual("You are already in the members list");
            done();
          });
      });
      it("should not add the user to the unapprovedMembers", done => {
        request(app)
          .post(`/organisations/${id}/join`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async () => {
            const org = await Organisation.get(id);
            expect(org.unapprovedMembers.length).toEqual(0);
            done();
          });
      });
    });
  });

  describe("# POST /organisations/:id/members/:memberId/approve", () => {
    let member = null;
    beforeEach(async done => {
      member = await OrganisationHelper.createMember(user);
      done();
    });
    describe("when the user is not authenticated", () => {
      it("should return an error", done => {
        request(app)
          .post(`/organisations/${id}/members/${member.id}/approve`)
          .set("Authorization", "Bearer INVALID_TOKEN")
          .expect(httpStatus.UNAUTHORIZED)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Not Authorised");
            done();
          });
      });
    });
    describe("when the user is not the owner", () => {
      it("should return an error", done => {
        request(app)
          .post(`/organisations/${id}/members/${member.id}/approve`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.data).toEqual("You are not an owner of this organisation");
            done();
          });
      });
    });
    describe("when the user is the owner", () => {
      beforeEach(async done => {
        organisation.owners.push(user);
        await organisation.save();
        done();
      });
      describe("when the member is not found in the waiting list", () => {
        it("should return an error", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.data).toEqual("No pending join request found for this user");
              done();
            });
        });
      });
      describe("when the member is already a member", () => {
        beforeEach(async done => {
          organisation.members.push(member);
          await organisation.save();
          done();
        });
        it("should return an error", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.data).toEqual("You are already in the members list");
              done();
            });
        });
      });
      describe("when the member is in the unapproved list", () => {
        beforeEach(async done => {
          organisation.unapprovedMembers.push(member);
          await organisation.save();
          done();
        });
        it("should approve the request", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data).toEqual("Request approved.");
              done();
            });
        });
        it("should return add the member to the members list", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(id);
              expect(org.members.length).toEqual(1);

              const approvedMember = org.members[0];
              expect(approvedMember.id).toEqual(member.id);
              expect(approvedMember.approvedBy.userId).toEqual(user.id);
              expect(approvedMember.approvedAt).toBeTruthy();
              done();
            });
        });
        it("should return remove the member from the unapproved list", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(id);
              expect(org.unapprovedMembers.length).toEqual(0);
              done();
            });
        });
      });
      describe("when the member is in the rejected list", () => {
        beforeEach(async done => {
          organisation.rejectedMembers.push(member);
          await organisation.save();
          done();
        });
        it("should approve the request", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data).toEqual("Request approved.");
              done();
            });
        });
        it("should return add the member to the members list", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(id);
              expect(org.members.length).toEqual(1);

              const approvedMember = org.members[0];
              expect(approvedMember.id).toEqual(member.id);
              expect(approvedMember.approvedBy.userId).toEqual(user.id);
              expect(approvedMember.approvedAt).toBeTruthy();
              done();
            });
        });
        it("should return remove the member from the rejected list", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/approve`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(id);
              expect(org.rejectedMembers.length).toEqual(0);
              done();
            });
        });
      });
    });
  });

  describe.only("# POST /organisations/:id/members/:memberId/reject", () => {
    let member = null;
    beforeEach(async done => {
      member = await OrganisationHelper.createMember(user);
      done();
    });
    describe("when the user is not authenticated", () => {
      it("should return an error", done => {
        request(app)
          .post(`/organisations/${id}/members/${member.id}/reject`)
          .set("Authorization", "Bearer INVALID_TOKEN")
          .expect(httpStatus.UNAUTHORIZED)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Not Authorised");
            done();
          });
      });
    });
    describe("when the user is not the owner", () => {
      it("should return an error", done => {
        request(app)
          .post(`/organisations/${id}/members/${member.id}/reject`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.data).toEqual("You are not an owner of this organisation");
            done();
          });
      });
    });
    describe("when the user is the owner", () => {
      beforeEach(async done => {
        organisation.owners.push(user);
        await organisation.save();
        done();
      });
      describe("when the member is not found in the waiting list", () => {
        it("should return an error", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.data).toEqual("No pending join request found for this user");
              done();
            });
        });
      });
      describe("when the member is already a member", () => {
        beforeEach(async done => {
          organisation.members.push(member);
          await organisation.save();
          done();
        });
        it("should return an error", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.data).toEqual("You are already in the members list");
              done();
            });
        });
      });
      describe("when the member is already a rejected", () => {
        beforeEach(async done => {
          organisation.rejectedMembers.push(member);
          await organisation.save();
          done();
        });
        it("should return an error", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.data).toEqual("You are already in the rejectedMembers list");
              done();
            });
        });
      });
      describe("when the member is in the unapproved list", () => {
        beforeEach(async done => {
          organisation.unapprovedMembers.push(member);
          await organisation.save();
          done();
        });
        it("should reject the request", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data).toEqual("Request rejected.");
              done();
            });
        });
        it("should return add the member to the members list", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(id);
              expect(org.rejectedMembers.length).toEqual(1);

              const rejectedMember = org.rejectedMembers[0];
              expect(rejectedMember.id).toEqual(member.id);
              expect(rejectedMember.rejectedBy.userId).toEqual(user.id);
              expect(rejectedMember.rejectedAt).toBeTruthy();
              done();
            });
        });
        it("should return remove the member from the unapproved list", done => {
          request(app)
            .post(`/organisations/${id}/members/${member.id}/reject`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async () => {
              const org = await Organisation.get(id);
              expect(org.unapprovedMembers.length).toEqual(0);
              done();
            });
        });
      });
    });
  });
});
