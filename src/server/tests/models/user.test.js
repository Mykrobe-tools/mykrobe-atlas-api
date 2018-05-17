import chai, { expect } from "chai";
import dirtyChai from "dirty-chai";
import User from "../../models/user.model";

require("../setup");
const users = require("../fixtures/users");

chai.config.includeStack = true;
chai.use(dirtyChai);
let id = null;

beforeEach(done => {
  const userData = new User(users.thomas);
  userData.save().then(user => {
    id = user.id;
    done();
  });
});

afterEach(done => {
  User.remove({}, done);
});

describe("## User Functions", () => {
  it("should save a new user", done => {
    const userData = new User(users.admin);
    userData.save().then(user => {
      expect(user.firstname).to.equal("David");
      expect(user.lastname).to.equal("Robin");
      expect(user.phone).to.equal("06734929442");
      expect(user.email).to.equal("admin@nhs.co.uk");
      expect(user.valid).to.equal(true);
      done();
    });
  });
  it("should not save duplicate emails", async done => {
    const userData = new User(users.invalid.duplicateEmail);
    try {
      await userData.save();
    } catch (e) {
      expect(e.message).to.equal(
        "thomas@nhs.co.uk has already been registered"
      );
      done();
    }
  });
  it("should default valid to false", done => {
    const userData = new User(users.userToVerify);
    userData.save().then(user => {
      expect(user.firstname).to.equal("Sara");
      expect(user.lastname).to.equal("Crowe");
      expect(user.phone).to.equal("032435940944");
      expect(user.email).to.equal("sara@nhs.co.uk");
      expect(user.valid).to.equal(false);
      done();
    });
  });
  it("should fetch the user by id", done => {
    User.get(id).then(user => {
      expect(user.firstname).to.equal("Thomas");
      expect(user.lastname).to.equal("Carlos");
      done();
    });
  });
  it("should return an error if not found", done => {
    User.get("58d3f3795d34d121805fdc61").catch(e => {
      expect(e.name).to.equal("ObjectNotFound");
      expect(e.message).to.equal(
        "User not found with id 58d3f3795d34d121805fdc61"
      );
      done();
    });
  });
  it("should generate verificationToken", done => {
    User.get(id).then(user => {
      expect(user.verificationToken).to.equal("107166");
      user.generateVerificationToken().then(userWithToken => {
        expect(userWithToken.verificationToken).to.not.equal("107166");
        done();
      });
    });
  });
  it("should fetch the user by phone", done => {
    User.getByEmail("thomas@nhs.co.uk").then(user => {
      expect(user.firstname).to.equal("Thomas");
      expect(user.lastname).to.equal("Carlos");
      done();
    });
  });
  it("should return an error if email not found", done => {
    User.getByEmail("amir@nhs.co.uk").catch(e => {
      expect(e.name).to.equal("ObjectNotFound");
      expect(e.message).to.equal("The object requested was not found.");
      done();
    });
  });
  it("should find and update the user", done => {
    User.findUserAndUpdate({ firstname: "Thomas" }, { lastname: "Vardy" }).then(
      user => {
        expect(user.firstname).to.equal("Thomas");
        expect(user.lastname).to.equal("Vardy");
        done();
      }
    );
  });
  it("should return an error if the user was not found", done => {
    User.findUserAndUpdate({ firstname: "James" }, { lastname: "Vardy" }).catch(
      e => {
        expect(e.name).to.equal("ObjectNotFound");
        expect(e.message).to.equal(
          "No registered user with the given criteria"
        );
        done();
      }
    );
  });
  it("should find the user by resetPasswordToken", done => {
    User.getByResetPasswordToken("54VwcGr65AKaules/blueln7w1o").then(user => {
      expect(user.firstname).to.equal("Thomas");
      expect(user.lastname).to.equal("Carlos");
      done();
    });
  });
  it("should return an error if resetPasswordToken doesnt exist", done => {
    User.getByResetPasswordToken("000000").catch(e => {
      expect(e.name).to.equal("ObjectNotFound");
      expect(e.message).to.equal("No registered user with token 000000");
      done();
    });
  });
  it("should find the user by verificationToken", done => {
    User.getByVerificationToken(107166).then(user => {
      expect(user.firstname).to.equal("Thomas");
      expect(user.lastname).to.equal("Carlos");
      done();
    });
  });
  it("should return an error if combination doesnt match", done => {
    User.getByVerificationToken(107100).catch(e => {
      expect(e.name).to.equal("ObjectNotFound");
      expect(e.message).to.equal("No registered user with token 107100");
      done();
    });
  });
  it("should return the list of all users", done => {
    User.list().then(foundUsers => {
      expect(foundUsers.length).to.equal(1);
      done();
    });
  });
});
