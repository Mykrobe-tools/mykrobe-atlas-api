import Search from "../../models/search.model";
import User from "../../models/user.model";

require("../setup");
const searches = require("../fixtures/searches");
const users = require("../fixtures/users");

let user = null;
let id = null;

beforeEach(async () => {
  const userData = new User(users.thomas);
  const searchData = new Search(searches.emptySequence);
  user = await userData.save();
  searchData.user = user;
  const search = await searchData.save();
  id = search.id;
});

afterEach(async () => {
  await Search.remove({});
  await User.remove({});
});

describe("## Search Functions", () => {
  it("should save a new search with id", async done => {
    const searchData = new Search({
      type: "sequence",
      query: {
        seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
        threshold: 0.3
      },
      user
    });
    const savedSearchData = await searchData.save();

    expect(savedSearchData.id).toBeTruthy();
    expect(savedSearchData.type).toEqual("sequence");
    expect(savedSearchData.query.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGT");
    expect(savedSearchData.query.threshold).toEqual(0.3);
    expect(savedSearchData.user.firstname).toEqual("Thomas");

    done();
  });
  it("should fetch the search by id", async done => {
    const foundSearch = await Search.get(id);
    const query = foundSearch.get("query");

    expect(foundSearch.id).toEqual(id);
    expect(foundSearch.type).toEqual("sequence");
    expect(query.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGT");
    expect(query.threshold).toEqual(0.5);
    expect(foundSearch.user.firstname).toEqual("Thomas");

    done();
  });
  it("should return an error if not found", async done => {
    try {
      await Search.get("58d3f3795d34d121805fdc61");
      fail();
    } catch (e) {
      expect(e.name).toEqual("ObjectNotFound");
      expect(e.message).toEqual(
        "Search not found with id 58d3f3795d34d121805fdc61"
      );
      done();
    }
  });
  it("should transform search to json", async done => {
    const foundSearch = await Search.get(id);
    const json = foundSearch.toJSON();

    expect(json.type).toEqual("sequence");
    expect(json.query.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGT");
    expect(json.query.threshold).toEqual(0.5);
    expect(json.user.firstname).toEqual("Thomas");

    done();
  });
  it("should update search", async done => {
    const foundSearch = await Search.get(id);

    expect(foundSearch.id).toEqual(id);
    expect(foundSearch.type).toEqual("sequence");

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

    foundSearch.set("result", result);

    const savedSearchData = await foundSearch.save();

    const foundSearchResult = savedSearchData.get("result");

    expect(foundSearchResult.ABCD1.percent_kmers_found).toEqual(34);
    expect(foundSearchResult.ABCD2.percent_kmers_found).toEqual(99);
    expect(foundSearchResult.ABCD3.percent_kmers_found).toEqual(89);

    done();
  });
});
