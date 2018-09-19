import Search from "../../models/search.model";
import User from "../../models/user.model";

require("../setup");
const searches = require("../fixtures/searches");
const users = require("../fixtures/users");

let user = null;
let id = null;

beforeEach(async () => {
  const userData = new User(users.thomas);
  user = await userData.save();

  const searchData = new Search(searches.searchOnly.sequence);
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
      bigsi: {
        seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
        threshold: 0.3
      },
      user
    });
    try {
      const savedSearchData = await searchData.save();

      expect(savedSearchData.id).toBeTruthy();
      expect(savedSearchData.type).toEqual("sequence");
      expect(savedSearchData.bigsi.seq).toEqual(
        "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT"
      );
      expect(savedSearchData.bigsi.threshold).toEqual(0.3);
      expect(savedSearchData.user.firstname).toEqual("Thomas");
    } catch (e) {
      console.log(e);
    }

    done();
  });
  it("should fetch the search by id", async done => {
    const foundSearch = await Search.get(id);
    const bigsi = foundSearch.get("bigsi");

    expect(foundSearch.id).toEqual(id);
    expect(foundSearch.type).toEqual("sequence");
    expect(bigsi.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
    expect(bigsi.threshold).toEqual(0.9);
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
    expect(json.bigsi.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
    expect(json.bigsi.threshold).toEqual(0.9);
    expect(json.user.firstname).toEqual("Thomas");

    done();
  });
  it("should update search", async done => {
    const foundSearch = await Search.get(id);

    expect(foundSearch.id).toEqual(id);
    expect(foundSearch.type).toEqual("sequence");

    foundSearch.set("result", searches.results.sequence);

    const savedSearchData = await foundSearch.save();

    const foundSearchResult = savedSearchData.get("result");
    const result = foundSearchResult.result;

    expect(result.ERR017683.percent_kmers_found).toEqual(100);
    expect(result.ERR1149371.percent_kmers_found).toEqual(90);
    expect(result.ERR1163331.percent_kmers_found).toEqual(100);

    done();
  });
});
