import moment from "moment";

import SearchHelper from "../../src/server/helpers/SearchHelper";

import Search from "../../src/server/models/search.model";
import User from "../../src/server/models/user.model";

import Constants from "../../src/server/Constants";

import setup from "../setup";

import searches from "../fixtures/searches";
import users from "../fixtures/users";

let id = null;

beforeEach(async () => {
  const searchData = new Search(searches.searchOnly.sequence);

  const expires = moment();
  expires.add(1, "day");
  searchData.expires = expires.toISOString();

  const search = await searchData.save();
  id = search.id;
});

afterEach(async () => {
  await Search.deleteMany({});
  await User.deleteMany({});
});

describe("Search", () => {
  describe("#save", () => {
    describe("when the search is new", () => {
      it("should save a new search with id", async done => {
        const newSearchData = new Search({
          type: "sequence",
          bigsi: {
            type: "sequence",
            query: {
              seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
              threshold: 30
            }
          },
          status: Constants.SEARCH_PENDING
        });
        const hash = SearchHelper.generateHash({
          type: "sequence",
          bigsi: {
            type: "sequence",
            query: {
              seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
              threshold: 30
            }
          }
        });
        try {
          const savedSearchData = await newSearchData.save();

          expect(savedSearchData.id).toBeTruthy();
          expect(savedSearchData).toHaveProperty("type", "sequence");
          expect(savedSearchData.status).toEqual(Constants.SEARCH_PENDING);
          expect(savedSearchData.hash).toEqual(hash);

          expect(savedSearchData).toHaveProperty("bigsi");
          const bigsi = savedSearchData.get("bigsi");

          expect(bigsi).toHaveProperty("type", "sequence");
          expect(bigsi).toHaveProperty("query");
          const query = bigsi.query;
          expect(query.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGT");
          expect(query.threshold).toEqual(30);

          done();
        } catch (e) {
          fail(e);
        }
      });
      it("should set the hash", async done => {
        const search = new Search({
          type: "sequence",
          bigsi: {
            type: "sequence",
            query: {
              seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
              threshold: 30
            }
          },
          status: Constants.SEARCH_PENDING
        });

        const savedSearch = await search.save();
        expect(savedSearch.hash).toBeTruthy();
        done();
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
        expect(result).toHaveProperty("results");
        const results = result.results;
        expect(results.length).toEqual(3);

        results.forEach(result => {
          const isolateId = result.sample_name;
          const percentKmersFound = result.percent_kmers_found;
          switch (isolateId) {
            case "ERR017683":
              expect(percentKmersFound).toEqual(100);
              break;
            case "ERR1149371":
              expect(percentKmersFound).toEqual(90);
              break;
            case "ERR1163331":
              expect(percentKmersFound).toEqual(100);
              break;
          }
        });

        done();
      });
    });
  });
  describe("#saveResult", () => {
    describe("when overriding default TTL", () => {
      it("should save with the overriden TTL", async done => {
        const foundSearch = await Search.get(id);
        const hash = foundSearch.hash;

        const updatedSearch = await foundSearch.updateAndSetExpiry(
          {
            ERR017683: {
              percent_kmers_found: 100
            }
          },
          72
        );

        const newExpirationDate = moment();
        newExpirationDate.add(72, "hours");

        expect(updatedSearch.id).toEqual(foundSearch.id);

        const expires = moment(updatedSearch.expires);
        expect(expires.date()).toEqual(newExpirationDate.date());
        expect(expires.month()).toEqual(newExpirationDate.month());
        expect(expires.year()).toEqual(newExpirationDate.year());

        expect(updatedSearch.hash).toEqual(hash);
        expect(updatedSearch.status).toEqual(Constants.SEARCH_COMPLETE);

        const result = updatedSearch.get("result");
        expect(result.ERR017683.percent_kmers_found).toEqual(100);

        done();
      });
    });
    describe("when using default TTL", () => {
      it("should save with the default TTL", async done => {
        const foundSearch = await Search.get(id);
        const hash = foundSearch.hash;

        const updatedSearch = await foundSearch.updateAndSetExpiry({
          ERR017683: {
            percent_kmers_found: 100
          }
        });

        const newExpirationDate = moment();
        newExpirationDate.add(7, "days");

        expect(updatedSearch.id).toEqual(foundSearch.id);

        const expires = moment(updatedSearch.expires);
        expect(expires.date()).toEqual(newExpirationDate.date());
        expect(expires.month()).toEqual(newExpirationDate.month());
        expect(expires.year()).toEqual(newExpirationDate.year());

        expect(updatedSearch.hash).toEqual(hash);
        expect(updatedSearch.status).toEqual(Constants.SEARCH_COMPLETE);

        const result = updatedSearch.get("result");
        expect(result.ERR017683.percent_kmers_found).toEqual(100);

        done();
      });
    });
  });
  describe("when managing user searches", () => {
    describe("#addUser", () => {
      it("should add user to the users array", async done => {
        const search = new Search();
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
        expect(bigsi).toHaveProperty("type", "sequence");
        expect(bigsi).toHaveProperty("query");

        const query = bigsi.query;
        expect(query.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
        expect(query.threshold).toEqual(90);
        expect(foundSearch.status).toEqual(Constants.SEARCH_PENDING);
        expect(foundSearch.hash).toBeTruthy();

        done();
      });
      it("should return transformed json", async done => {
        const foundSearch = await Search.get(id);
        const json = foundSearch.toJSON();

        expect(json).toHaveProperty("type", "sequence");
        expect(json).toHaveProperty("status", Constants.SEARCH_PENDING);
        expect(json.hash).toBeTruthy();

        expect(json).toHaveProperty("bigsi");
        const bigsi = json.bigsi;

        expect(bigsi).toHaveProperty("type", "sequence");

        expect(bigsi).toHaveProperty("query");
        const query = bigsi.query;
        expect(query).toHaveProperty("seq", "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
        expect(query).toHaveProperty("threshold", 90);

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

          try {
            const savedSearch = await expiredSearchData.save();
            const isExpired = savedSearch.isExpired();

            expect(isExpired).toBe(true);

            done();
          } catch (e) {
            done();
          }
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
        const hash = SearchHelper.generateHash({
          type: "sequence",
          bigsi: {
            type: "sequence",
            query: {
              seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
              threshold: 90
            }
          }
        });
        const foundSearch = await Search.findByHash(hash);
        expect(foundSearch.id).toEqual(id);
        expect(foundSearch.type).toEqual("sequence");
        expect(foundSearch.status).toEqual(Constants.SEARCH_PENDING);
        expect(foundSearch.hash).toEqual(hash);

        const bigsi = foundSearch.get("bigsi");
        expect(bigsi).toHaveProperty("type", "sequence");
        expect(bigsi).toHaveProperty("query");
        const query = bigsi.query;
        expect(query).toHaveProperty("seq", "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
        expect(query).toHaveProperty("threshold", 90);

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
  describe("#isPending", () => {
    describe("when status is pending", () => {
      it("should return true", async done => {
        const search = new Search(searches.searchOnly.pendingSearch);
        const savedSearch = await search.save();

        expect(savedSearch.isPending()).toEqual(true);

        done();
      });
    });
    describe("when status is complete", () => {
      it("should return false", async done => {
        const search = new Search(searches.searchOnly.completeSearch);
        const savedSearch = await search.save();

        expect(savedSearch.isPending()).toEqual(false);

        done();
      });
    });
  });
  describe("#isComplete", () => {
    describe("when status is pending", () => {
      it("should return false", async () => {
        const search = new Search(searches.searchOnly.pendingSearch);
        const savedSearch = await search.save();

        expect(savedSearch.isComplete()).toEqual(false);
      });
    });
    describe("when status is complete", () => {
      it("should return true", async done => {
        const search = new Search(searches.searchOnly.completeSearch);
        const savedSearch = await search.save();

        expect(savedSearch.isComplete()).toEqual(true);

        done();
      });
    });
  });
  describe("#isExpired", () => {
    describe("when the expiry date has passed", () => {
      it("should return true", async done => {
        const search = new Search(searches.searchOnly.expiredSearch);
        const savedSearch = await search.save();

        expect(savedSearch.isExpired()).toEqual(true);

        done();
      });
    });
    describe("when the expiry date has not passed", () => {
      it("should return false", async done => {
        const search = new Search(searches.searchOnly.expiredSearch);
        const expires = moment();
        expires.add(1, "day");
        search.expires = expires.toISOString();

        const savedSearch = await search.save();

        expect(savedSearch.isExpired()).toEqual(false);

        done();
      });
    });
  });
});
