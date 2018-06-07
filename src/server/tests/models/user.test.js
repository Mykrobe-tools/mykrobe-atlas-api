import User from "../../models/user.model";

require("../setup");
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

describe("## User Functions", () => {
  it("should save a new user", async done => {
    const userData = new User(users.admin);
    const user = await userData.save();
    expect(user.firstname).toEqual("David");
    expect(user.lastname).toEqual("Robin");
    expect(user.phone).toEqual("06734929442");
    expect(user.email).toEqual("admin@nhs.co.uk");
    expect(user.valid).toEqual(true);
    done();
  });
  it("should not save duplicate emails", async done => {
    const userData = new User(users.invalid.duplicateEmail);
    try {
      await userData.save();
    } catch (e) {
      expect(e.message).toEqual("thomas@nhs.co.uk has already been registered");
      done();
    }
  });
  it("should default valid to false", async done => {
    const userData = new User(users.userToVerify);
    const user = await userData.save();
    expect(user.firstname).toEqual("Sara");
    expect(user.lastname).toEqual("Crowe");
    expect(user.phone).toEqual("032435940944");
    expect(user.email).toEqual("sara@nhs.co.uk");
    expect(user.valid).toEqual(false);
    done();
  });
  it("should fetch the user by id", async done => {
    const user = await User.get(id);
    expect(user.firstname).toEqual("Thomas");
    expect(user.lastname).toEqual("Carlos");
    done();
  });
  it("should return an error if not found", async done => {
    try {
      await User.get("58d3f3795d34d121805fdc61");
      fail();
    } catch (e) {
      expect(e.name).toEqual("ObjectNotFound");
      expect(e.message).toEqual(
        "User not found with id 58d3f3795d34d121805fdc61"
      );
      done();
    }
  });
  it("should generate verificationToken", async done => {
    const user = await User.get(id);
    expect(user.verificationToken).toEqual("107166");
    const userWithToken = await user.generateVerificationToken();
    expect(userWithToken.verificationToken).not.toEqual("107166");
    done();
  });
  it("should fetch the user by phone", async done => {
    const user = await User.getByEmail("thomas@nhs.co.uk");
    expect(user.firstname).toEqual("Thomas");
    expect(user.lastname).toEqual("Carlos");
    done();
  });
  it("should return an error if email not found", async done => {
    try {
      await User.getByEmail("amir@nhs.co.uk");
      fail();
    } catch (e) {
      expect(e.name).toEqual("ObjectNotFound");
      expect(e.message).toEqual("The object requested was not found.");
      done();
    }
  });
  it("should find and update the user", async done => {
    const user = await User.findUserAndUpdate(
      { firstname: "Thomas" },
      { lastname: "Vardy" }
    );
    expect(user.firstname).toEqual("Thomas");
    expect(user.lastname).toEqual("Vardy");
    done();
  });
  it("should return an error if the user was not found", async done => {
    try {
      await User.findUserAndUpdate(
        { firstname: "James" },
        { lastname: "Vardy" }
      );
      fail();
    } catch (e) {
      expect(e.name).toEqual("ObjectNotFound");
      expect(e.message).toEqual("No registered user with the given criteria");
      done();
    }
  });
  it("should find the user by resetPasswordToken", async done => {
    const user = await User.getByResetPasswordToken(
      "54VwcGr65AKaules/blueln7w1o"
    );
    expect(user.firstname).toEqual("Thomas");
    expect(user.lastname).toEqual("Carlos");
    done();
  });
  it("should return an error if resetPasswordToken doesnt exist", async done => {
    try {
      await User.getByResetPasswordToken("000000");
      fail();
    } catch (e) {
      expect(e.name).toEqual("ObjectNotFound");
      expect(e.message).toEqual("No registered user with token 000000");
      done();
    }
  });
  it("should find the user by verificationToken", async done => {
    const user = await User.getByVerificationToken(107166);
    expect(user.firstname).toEqual("Thomas");
    expect(user.lastname).toEqual("Carlos");
    done();
  });
  it("should return an error if combination doesnt match", async done => {
    try {
      await User.getByVerificationToken(107100);
      fail();
    } catch (e) {
      expect(e.name).toEqual("ObjectNotFound");
      expect(e.message).toEqual("No registered user with token 107100");
      done();
    }
  });
  it("should return the list of all users", async done => {
    const foundUsers = await User.list();
    expect(foundUsers.length).toEqual(1);
    done();
  });
});
