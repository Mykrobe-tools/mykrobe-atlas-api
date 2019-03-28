import Search from "../../src/server/models/search.model";
import User from "../../src/server/models/user.model";

import setup from "../setup";

import searches from "../fixtures/searches";
import users from "../fixtures/users";

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

describe("Search", () => {
  describe("#save", () => {
    describe("when the search is new", () => {
      it("should save a new search with id", async done => {
        const newSearchData = new Search({
          type: "sequence",
          bigsi: {
            seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
            threshold: 0.3
          },
          status: Search.constants().PENDING,
          hash: "2312edsdcasqwr12e"
        });
        try {
          const savedSearchData = await newSearchData.save();

          expect(savedSearchData.id).toBeTruthy();
          expect(savedSearchData.type).toEqual("sequence");
          expect(savedSearchData.bigsi.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGT");
          expect(savedSearchData.bigsi.threshold).toEqual(0.3);
          expect(savedSearchData.status).toEqual(Search.constants().PENDING);
          expect(savedSearchData.hash).toEqual("2312edsdcasqwr12e");
          done();
        } catch (e) {
          fail();
          console.log(e);
        }
      });
    });
    describe("when the search already exists", () => {
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
  });
  describe("#saveResult", () => {
    describe("when overriding default TTL", () => {
      it("should save with the overriden TTL", async done => {
        const foundSearch = await Search.get(id);

        const updatedSearch = await foundSearch.saveResult(
          {
            ERR017683: {
              percent_kmers_found: 100
            }
          },
          72
        );

        var newExpirationDate = new Date();
        newExpirationDate.setHours(newExpirationDate.getHours() + 72);

        expect(updatedSearch.id).toEqual(foundSearch.id);
        expect(updatedSearch.expires.getDay()).toEqual(newExpirationDate.getDay());
        expect(updatedSearch.expires.getMonth()).toEqual(newExpirationDate.getMonth());
        expect(updatedSearch.expires.getYear()).toEqual(newExpirationDate.getYear());
        expect(updatedSearch.hash).toEqual("f13efe3c6fb77cac5fab23f8bd789050f3a52064");
        expect(updatedSearch.status).toEqual(Search.constants().COMPLETE);

        const result = updatedSearch.get("result");
        expect(result.ERR017683.percent_kmers_found).toEqual(100);

        done();
      });
    });
    describe("when using default TTL", () => {
      it("should save with the default TTL", async done => {
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
        expect(updatedSearch.expires.getMonth()).toEqual(newExpirationDate.getMonth());
        expect(updatedSearch.expires.getYear()).toEqual(newExpirationDate.getYear());
        expect(updatedSearch.hash).toEqual("f13efe3c6fb77cac5fab23f8bd789050f3a52064");
        expect(updatedSearch.status).toEqual(Search.constants().COMPLETE);

        const result = updatedSearch.get("result");
        expect(result.ERR017683.percent_kmers_found).toEqual(100);

        done();
      });
    });
  });
  describe("when managing user searches", () => {
    describe("#addUser", () => {
      it("should add user to the users array", async done => {
        const userData = new User(users.thomas);
        const user = await userData.save();
        const foundSearch = await Search.get(id);

        await foundSearch.addUser(user);
        expect(foundSearch.users.length).toEqual(1);
        expect(foundSearch.users[0].id).toEqual(user.id);
        done();
      });
    });
    describe("#clearUsers", () => {
      it("should clear all the users", async done => {
        const userData = new User(users.thomas);
        const user = await userData.save();
        const foundSearch = await Search.get(id);

        await foundSearch.clearUsers();
        expect(foundSearch.users.length).toEqual(0);
        done();
      });
    });
    describe("#isPending", () => {
      describe("when the search is pending", () => {
        it("should mark is as pending", async done => {
          const foundSearch = await Search.get(id);
          const isPending = foundSearch.isPending();

          expect(isPending).toBe(true);

          done();
        });
      });
    });
    describe("#userExists", () => {
      describe("when the user exists in a search", () => {
        it("should return true", async done => {
          const userData = new User(users.thomas);
          const user = await userData.save();
          const foundSearch = await Search.get(id);

          await foundSearch.addUser(user);
          const userExists = foundSearch.userExists(user);

          expect(userExists).toBeTruthy();
          done();
        });
      });
      describe("when the user does not exists in a search", () => {
        it("should return false", async done => {
          const userData = new User(users.thomas);

          const user = await userData.save();
          const foundSearch = await Search.get(id);

          const userExists = foundSearch.userExists(user);

          expect(userExists).toBeFalsy();
          done();
        });
      });
    });
  });
  describe("#get", () => {
    describe("when a search exists with the id", () => {
      it("should fetch the search by id", async done => {
        const foundSearch = await Search.get(id);
        const bigsi = foundSearch.get("bigsi");

        expect(foundSearch.id).toEqual(id);
        expect(foundSearch.type).toEqual("sequence");
        expect(bigsi.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
        expect(bigsi.threshold).toEqual(0.9);
        expect(foundSearch.status).toEqual(Search.constants().PENDING);
        expect(foundSearch.hash).toEqual("f13efe3c6fb77cac5fab23f8bd789050f3a52064");

        done();
      });
      it("should return transform json", async done => {
        const foundSearch = await Search.get(id);
        const json = foundSearch.toJSON();

        expect(json.type).toEqual("sequence");
        expect(json.bigsi.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
        expect(json.bigsi.threshold).toEqual(0.9);
        expect(json.status).toEqual(Search.constants().PENDING);
        expect(json.hash).toEqual("f13efe3c6fb77cac5fab23f8bd789050f3a52064");

        done();
      });
      describe("when the search is active", () => {
        it("should mark the search as not expired", async done => {
          const foundSearch = await Search.get(id);
          const isExpired = foundSearch.isExpired();

          expect(isExpired).toBe(false);

          done();
        });
      });
      describe("when the search has expired", () => {
        it("should mark the search as expired", async done => {
          const expiredSearchData = new Search(searches.searchOnly.expiredSearch);
          const savedSearch = await expiredSearchData.save();

          const isExpired = savedSearch.isExpired();

          expect(isExpired).toBe(true);

          done();
        });
      });
    });
    describe("when no search has a matching id", () => {
      it("should return an error if not found", async done => {
        try {
          await Search.get("58d3f3795d34d121805fdc61");
          fail();
        } catch (e) {
          expect(e.name).toEqual("ObjectNotFound");
          expect(e.message).toEqual("Search not found with id 58d3f3795d34d121805fdc61");
          done();
        }
      });
    });
  });
  describe("#findByHash", () => {
    describe("when a search exists with the hash", () => {
      it("should return the search", async done => {
        const foundSearch = await Search.findByHash("f13efe3c6fb77cac5fab23f8bd789050f3a52064");
        const bigsi = foundSearch.get("bigsi");

        expect(foundSearch.id).toEqual(id);
        expect(foundSearch.type).toEqual("sequence");
        expect(bigsi.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
        expect(bigsi.threshold).toEqual(0.9);
        expect(foundSearch.status).toEqual(Search.constants().PENDING);
        expect(foundSearch.hash).toEqual("f13efe3c6fb77cac5fab23f8bd789050f3a52064");

        done();
      });
    });
    describe("when no search matches the hash", () => {
      it("should return an null", async done => {
        const search = await Search.findByHash("66b7d7e64871aa9fda1bdc8e88a28df797648");
        expect(search).toBe(null);
        done();
      });
    });
  });
});
