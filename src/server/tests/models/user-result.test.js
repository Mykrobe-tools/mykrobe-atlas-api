import UserResult from "../../models/user-result.model";
import User from "../../models/user.model";

require("../setup");
const results = require("../fixtures/user-results");
const users = require("../fixtures/users");

let user = null;
let id = null;

beforeEach(async () => {
  const userData = new User(users.thomas);
  const userResultData = new UserResult(results.emptySequence);
  user = await userData.save();
  userResultData.user = user;
  const userResult = await userResultData.save();
  id = userResult.id;
});

afterEach(async () => {
  await UserResult.remove({});
  await User.remove({});
});

describe("## UserResult Functions", () => {
  it("should save a new userResult with resultId", async done => {
    const userResultData = new UserResult({
      resultId: "85e3447c-a4fa-4eb8-bace-3f4b67b97b96",
      type: "sequence",
      query: {
        seq: "AFSHSYFGHJKIJKKFF",
        threshold: 0.3
      },
      user
    });
    const savedUserResultData = await userResultData.save();

    expect(savedUserResultData.resultId).toEqual(
      "85e3447c-a4fa-4eb8-bace-3f4b67b97b96"
    );
    expect(savedUserResultData.type).toEqual("sequence");
    expect(savedUserResultData.query.seq).toEqual("AFSHSYFGHJKIJKKFF");
    expect(savedUserResultData.query.threshold).toEqual(0.3);
    expect(savedUserResultData.user.firstname).toEqual("Thomas");

    done();
  });
  it("should fetch the userResult by id", async done => {
    const foundUserResult = await UserResult.get(id);
    const query = foundUserResult.get("query");

    expect(foundUserResult.resultId).toEqual(
      "0f3b4f77-c815-4e2a-8373-2c23e829c07a"
    );
    expect(foundUserResult.type).toEqual("sequence");
    expect(query.seq).toEqual("DSJHGFKJSELJEFJELJCLHFELFHESLJKJEF");
    expect(query.threshold).toEqual(0.5);
    expect(foundUserResult.user.firstname).toEqual("Thomas");

    done();
  });
  it("should return an error if not found", async done => {
    try {
      await UserResult.get("58d3f3795d34d121805fdc61");
      fail();
    } catch (e) {
      expect(e.name).toEqual("ObjectNotFound");
      expect(e.message).toEqual(
        "UserResult not found with id 58d3f3795d34d121805fdc61"
      );
      done();
    }
  });
  it("should transform userResult to json", async done => {
    const foundUserResult = await UserResult.get(id);
    const json = foundUserResult.toJSON();

    expect(json.resultId).toEqual("0f3b4f77-c815-4e2a-8373-2c23e829c07a");
    expect(json.type).toEqual("sequence");
    expect(json.query.seq).toEqual("DSJHGFKJSELJEFJELJCLHFELFHESLJKJEF");
    expect(json.query.threshold).toEqual(0.5);
    expect(json.user.firstname).toEqual("Thomas");

    done();
  });
  it("should update userResult", async done => {
    const foundUserResult = await UserResult.get(id);

    expect(foundUserResult.resultId).toEqual(
      "0f3b4f77-c815-4e2a-8373-2c23e829c07a"
    );
    expect(foundUserResult.type).toEqual("sequence");

    const result = {
      ABCD1: {
        percent_kmers_found: 34
      },
      ABCD2: {
        percent_kmers_found: 99
      },
      ABCD3: {
        percent_kmers_found: 89
      }
    };

    foundUserResult.set("result", result);

    const savedUserResultData = await foundUserResult.save();

    const foundResult = savedUserResultData.get("result");

    expect(foundResult.ABCD1.percent_kmers_found).toEqual(34);
    expect(foundResult.ABCD2.percent_kmers_found).toEqual(99);
    expect(foundResult.ABCD3.percent_kmers_found).toEqual(89);

    done();
  });
});
