import User from "../../src/server/models/user.model";
import setup from "../setup";

const users = require("../fixtures/users");

let id = null;

beforeEach(async done => {
  const userData = new User(users.thomas);
  const user = await userData.save();
  id = user.id;
  done();
});

afterEach(async done => {
  await User.remove({});
  done();
});

describe("User", () => {
  describe("#save", () => {
    describe("when valid", () => {
      it("should save the user", async done => {
        const userData = new User(users.admin);
        const user = await userData.save();
        expect(user.firstname).toEqual("David");
        expect(user.lastname).toEqual("Robin");
        expect(user.phone).toEqual("06734929442");
        expect(user.email).toEqual("admin@nhs.co.uk");
        done();
      });
      it("should default valid to false", async done => {
        const userData = new User(users.userToVerify);
        const user = await userData.save();
        expect(user.firstname).toEqual("Sara");
        expect(user.lastname).toEqual("Crowe");
        expect(user.phone).toEqual("032435940944");
        expect(user.email).toEqual("sara@nhs.co.uk");
        done();
      });
    });
    describe("when using a duplicate email", () => {
      it("should return an error message", async done => {
        const userData = new User(users.invalid.duplicateEmail);
        try {
          await userData.save();
        } catch (e) {
          expect(e.message).toEqual(
            "User validation failed: email: thomas@nhs.co.uk has already been registered"
          );
          done();
        }
      });
    });
    describe("when missing an email address", () => {
      it("should return an error message", async done => {
        const userData = new User(users.invalid.missingEmail);
        try {
          await userData.save();
        } catch (e) {
          expect(e.code).toEqual("ValidationError");
          expect(e.data.errors.email.message).toEqual("should have required property 'email'");
          done();
        }
      });
    });
  });
  describe("#get", () => {
    describe("when the id exists", () => {
      it("should return the user", async done => {
        const user = await User.get(id);
        expect(user.firstname).toEqual("Thomas");
        expect(user.lastname).toEqual("Carlos");
        done();
      });
    });
    describe("when the id does not exist", () => {
      it("should return an error message", async done => {
        try {
          await User.get("58d3f3795d34d121805fdc61");
          fail();
        } catch (e) {
          expect(e.name).toEqual("ObjectNotFound");
          expect(e.message).toEqual("User not found with id 58d3f3795d34d121805fdc61");
          done();
        }
      });
    });
  });
  describe("#getByEmail", () => {
    describe("when the email exists", () => {
      it("should return the user", async done => {
        const user = await User.getByEmail("thomas@nhs.co.uk");
        expect(user.firstname).toEqual("Thomas");
        expect(user.lastname).toEqual("Carlos");
        done();
      });
    });
    describe("when the email does not exist", () => {
      it("should return an error message", async done => {
        try {
          await User.getByEmail("amir@nhs.co.uk");
          fail();
        } catch (e) {
          expect(e.name).toEqual("ObjectNotFound");
          expect(e.message).toEqual("The object requested was not found.");
          done();
        }
      });
    });
  });
  describe("#findUserAndUpdate", () => {
    describe("when the user matches", () => {
      it("should update the user", async done => {
        const user = await User.findUserAndUpdate({ firstname: "Thomas" }, { lastname: "Vardy" });
        expect(user.firstname).toEqual("Thomas");
        expect(user.lastname).toEqual("Vardy");
        done();
      });
    });
    describe("when the user does not match", () => {
      it("should return an error message", async done => {
        try {
          await User.findUserAndUpdate({ firstname: "James" }, { lastname: "Vardy" });
          fail();
        } catch (e) {
          expect(e.name).toEqual("ObjectNotFound");
          expect(e.message).toEqual("No registered user with the given criteria");
          done();
        }
      });
    });
  });
  describe("#list", () => {
    it("should return a list of all users", async done => {
      const foundUsers = await User.list();
      expect(foundUsers.length).toEqual(1);
      done();
    });
  });
});
