import Search from "../../models/search.model";
import User from "../../models/user.model";

require("../setup");
const searches = require("../fixtures/searches");
const users = require("../fixtures/users");

let id = null;

beforeEach(async () => {
  const searchData = new Search(searches.searchOnly.sequence);
  const expires = new Date();
  expires.setDate(expires.getDate() + 1);
  searchData.expires = expires;
  const search = await searchData.save();

  id = search.id;
});

afterEach(async () => {
  await Search.remove({});
  await User.remove({});
});

describe("## Search Functions", () => {
  it("should save a new search with id", async done => {
    const newSearchData = new Search({
      type: "sequence",
      bigsi: {
        seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
        threshold: 0.3
      },
      status: "pending",
      hash: "2312edsdcasqwr12e"
    });
    try {
      const savedSearchData = await newSearchData.save();

      expect(savedSearchData.id).toBeTruthy();
      expect(savedSearchData.type).toEqual("sequence");
      expect(savedSearchData.bigsi.seq).toEqual(
        "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT"
      );
      expect(savedSearchData.bigsi.threshold).toEqual(0.3);
      expect(savedSearchData.status).toEqual("pending");
      expect(savedSearchData.hash).toEqual("2312edsdcasqwr12e");
      done();
    } catch (e) {
      fail();
      console.log(e);
    }
  });
  it("should fetch the search by id", async done => {
    const foundSearch = await Search.get(id);
    const bigsi = foundSearch.get("bigsi");

    expect(foundSearch.id).toEqual(id);
    expect(foundSearch.type).toEqual("sequence");
    expect(bigsi.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
    expect(bigsi.threshold).toEqual(0.9);
    expect(foundSearch.status).toEqual("pending");
    expect(foundSearch.hash).toEqual(
      "66b7d7e64871aa9fda1bdc8e88a28df797648d80"
    );

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
    expect(json.status).toEqual("pending");
    expect(json.hash).toEqual("66b7d7e64871aa9fda1bdc8e88a28df797648d80");

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
  it("should fetch the search by hash", async done => {
    const foundSearch = await Search.findByHash(
      "66b7d7e64871aa9fda1bdc8e88a28df797648d80"
    );
    const bigsi = foundSearch.get("bigsi");

    expect(foundSearch.id).toEqual(id);
    expect(foundSearch.type).toEqual("sequence");
    expect(bigsi.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
    expect(bigsi.threshold).toEqual(0.9);
    expect(foundSearch.status).toEqual("pending");
    expect(foundSearch.hash).toEqual(
      "66b7d7e64871aa9fda1bdc8e88a28df797648d80"
    );

    done();
  });
  it("should return an null if hash not found", async done => {
    const search = await Search.findByHash(
      "66b7d7e64871aa9fda1bdc8e88a28df797648"
    );
    expect(search).toBe(null);
    done();
  });
  it("should claculate isExpired for active search", async done => {
    const foundSearch = await Search.get(id);
    const isExpired = foundSearch.isExpired();

    expect(isExpired).toBe(false);

    done();
  });

  it("should claculate isExpired for expired search", async done => {
    const expiredSearchData = new Search(searches.searchOnly.expiredSearch);
    const savedSearch = await expiredSearchData.save();

    const isExpired = savedSearch.isExpired();

    expect(isExpired).toBe(true);

    done();
  });
  it("should update the search", async done => {
    const foundSearch = await Search.get(id);

    const updatedSearch = await foundSearch.saveResult(
      {
        ERR017683: {
          percent_kmers_found: 100
        }
      },
      3
    );

    var newExpirationDate = new Date();
    newExpirationDate.setDate(newExpirationDate.getDate() + 3);

    expect(updatedSearch.id).toEqual(foundSearch.id);
    expect(updatedSearch.expires.getDay()).toEqual(newExpirationDate.getDay());
    expect(updatedSearch.expires.getMonth()).toEqual(
      newExpirationDate.getMonth()
    );
    expect(updatedSearch.expires.getYear()).toEqual(
      newExpirationDate.getYear()
    );
    expect(updatedSearch.hash).toEqual(
      "66b7d7e64871aa9fda1bdc8e88a28df797648d80"
    );
    expect(updatedSearch.status).toEqual("complete");

    const result = updatedSearch.get("result");
    expect(result.ERR017683.percent_kmers_found).toEqual(100);

    done();
  });
  it("should update the search from config when no param passed", async done => {
    const foundSearch = await Search.get(id);

    const updatedSearch = await foundSearch.saveResult({
      ERR017683: {
        percent_kmers_found: 100
      }
    });

    var newExpirationDate = new Date();
    newExpirationDate.setDate(newExpirationDate.getDate() + 7);

    expect(updatedSearch.id).toEqual(foundSearch.id);
    expect(updatedSearch.expires.getDay()).toEqual(newExpirationDate.getDay());
    expect(updatedSearch.expires.getMonth()).toEqual(
      newExpirationDate.getMonth()
    );
    expect(updatedSearch.expires.getYear()).toEqual(
      newExpirationDate.getYear()
    );
    expect(updatedSearch.hash).toEqual(
      "66b7d7e64871aa9fda1bdc8e88a28df797648d80"
    );
    expect(updatedSearch.status).toEqual("complete");

    const result = updatedSearch.get("result");
    expect(result.ERR017683.percent_kmers_found).toEqual(100);

    done();
  });
  it("should add user to the users array", async done => {
    const userData = new User(users.thomas);
    const user = await userData.save();
    const foundSearch = await Search.get(id);

    await foundSearch.addUser(user);
    expect(foundSearch.users.length).toEqual(1);
    expect(foundSearch.users[0].id).toEqual(user.id);
    done();
  });
  it("should clear all the users", async done => {
    const userData = new User(users.thomas);
    const user = await userData.save();
    const foundSearch = await Search.get(id);

    await foundSearch.clearUsers();
    expect(foundSearch.users.length).toEqual(0);
    done();
  });
  it("should claculate isPending for a search", async done => {
    const foundSearch = await Search.get(id);
    const isPending = foundSearch.isPending();

    expect(isPending).toBe(true);

    done();
  });
  it("should return truthy when the user exist in a search", async done => {
    const userData = new User(users.thomas);
    const user = await userData.save();
    const foundSearch = await Search.get(id);

    await foundSearch.addUser(user);
    const userExists = foundSearch.userExists(user);

    expect(userExists).toBeTruthy();
    done();
  });
  it("should return falsy when the user doesnt exist in a search", async done => {
    const userData = new User(users.thomas);
    const user = await userData.save();
    const foundSearch = await Search.get(id);

    const userExists = foundSearch.userExists(user);

    expect(userExists).toBeFalsy();
    done();
  });
});
