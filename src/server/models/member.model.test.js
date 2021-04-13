import { MongoClient } from "mongodb";
import mongoose from "mongoose";

import Member from "./member.model";
import User from "./user.model";

import Members from "./__fixtures__/Members";
import Users from "./__fixtures__/Users";

const args = {
  id: null,
  client: null,
  user: null,
  member: null
};

beforeAll(async done => {
  // db: Use in-memory db for tests
  args.client = await MongoClient.connect(global.__MONGO_URI__, {});
  await args.client.db(global.__MONGO_DB_NAME__);
  await mongoose.connect(global.__MONGO_URI__, {});

  done();
});

beforeEach(async done => {
  const memberData = new Member(Members.valid.approved);
  const userData = new User(Users.valid.thomas);
  args.user = await userData.save();
  memberData.userId = args.user.id;
  args.member = await memberData.save();

  done();
});
afterEach(async done => {
  await Member.deleteMany({});
  await User.deleteMany({});
  done();
});

describe("Member", () => {
  describe("#save", () => {
    describe("when valid", () => {
      it("should save the member", async done => {
        expect(args.member.firstname).toEqual("Thomas");
        expect(args.member.lastname).toEqual("Carlos");
        expect(args.member.phone).toEqual("07737929442");
        expect(args.member.username).toEqual("thomas.carlos@nhs.net");
        expect(args.member.email).toEqual("thomas.carlos@nhs.net");
        expect(args.member.action).toEqual("approved");

        done();
      });

      it("should save the users against the member", async done => {
        const userId = args.member.userId;
        expect(userId).toEqual(args.user.id);

        done();
      });
    });
  });
  describe("#get", () => {
    describe("when valid", () => {
      describe("when the member id exists", () => {
        it("should return the member", async done => {
          const match = await Member.get(args.member.id);
          expect(match).toBeTruthy();
          done();
        });
        it("should populate the userId", async done => {
          const match = await Member.get(args.member.id);

          const userId = match.userId;
          expect(userId).toEqual(args.user.id);

          done();
        });
      });
    });
    describe("when not valid", () => {
      describe("when the member does not exist", () => {
        it("should return null", async done => {
          const match = await Member.get("5fdb395ccbb5c222f2aec1bb");
          expect(match).toBeFalsy();
          done();
        });
      });
    });
  });
  describe("#toJSON", () => {
    describe("when valid", () => {
      it("return core member details", async done => {
        const foundMember = await Member.get(args.member.id);
        const json = foundMember.toJSON();
        expect(json.firstname).toEqual("Thomas");
        done();
      });
    });
  });
});
