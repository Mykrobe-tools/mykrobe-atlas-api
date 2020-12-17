import Member from "../../src/server/models/member.model";
import User from "../../src/server/models/user.model";

import setup from "../setup";

import members from "../fixtures/members";
import users from "../fixtures/users";

describe("Member", () => {
  let member,
    user = null;
  beforeEach(async done => {
    const memberData = new Member(members.approved);
    const userData = new User(users.thomas);
    user = await userData.save();
    memberData.userId = user.id;
    member = await memberData.save();

    done();
  });
  afterEach(async done => {
    await Member.deleteMany({});
    await User.deleteMany({});
    done();
  });

  describe("#save", () => {
    describe("with valid data", () => {
      it("should save the member", async done => {
        expect(member.firstname).toEqual("Thomas");
        expect(member.lastname).toEqual("Carlos");
        expect(member.phone).toEqual("07737929442");
        expect(member.username).toEqual("thomas.carlos@nhs.net");
        expect(member.email).toEqual("thomas.carlos@nhs.net");
        expect(member.action).toEqual("approved");

        done();
      });

      it("should save the users against the member", async done => {
        const userId = member.userId;
        expect(userId).toEqual(user.id);

        done();
      });
    });
  });
  describe("#get", () => {
    describe("when the member id exists", () => {
      it("should return the member", async done => {
        const match = await Member.get(member.id);
        expect(match).toBeTruthy();
        done();
      });
      it("should populate the userId", async done => {
        const match = await Member.get(member.id);

        const userId = match.userId;
        expect(userId).toEqual(user.id);

        done();
      });
    });
    describe("when the member does not exist", () => {
      it("should return null", async done => {
        const match = await Member.get("5fdb395ccbb5c222f2aec1bb");
        expect(match).toBeFalsy();
        done();
      });
    });
    describe("#toJSON", () => {
      it("return core member details", async done => {
        const foundMember = await Member.get(member.id);
        const json = foundMember.toJSON();
        expect(json.firstname).toEqual("Thomas");
        done();
      });
    });
  });
});
