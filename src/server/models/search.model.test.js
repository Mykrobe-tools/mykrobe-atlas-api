import { MongoClient } from "mongodb";
import mongoose from "mongoose";

import moment from "moment";

import SearchHelper from "../helpers/SearchHelper";

import Search from "./search.model";
import User from "./user.model";

import Constants from "../Constants";

import Searches from "./__fixtures__/Searches";
import Users from "./__fixtures__/Users";

let id = null;

const args = {
  id: null,
  search: null,
  client: null
};

beforeAll(async done => {
  // db: Use in-memory db for tests
  args.client = await MongoClient.connect(global.__MONGO_URI__, {});
  await args.client.db(global.__MONGO_DB_NAME__);
  await mongoose.connect(global.__MONGO_URI__, {});

  done();
});

beforeEach(async () => {
  const searchData = new Search(Searches.valid.searchOnly.sequence);

  const expires = moment();
  expires.add(1, "day");
  searchData.expires = expires.toISOString();

  args.search = await searchData.save();
  args.id = args.search.id;
});

afterEach(async () => {
  await Search.deleteMany({});
  await User.deleteMany({});
});

describe("Search", () => {
  describe("#save", () => {
    describe("when valid", () => {
      describe("when creating a new search", () => {
        let savedSearch = null;
        beforeEach(async done => {
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

          savedSearch = await newSearchData.save();
          done();
        });
        it("should assign an id", done => {
          expect(savedSearch.id).toBeTruthy();
          done();
        });
        it("should save core details", done => {
          expect(savedSearch).toHaveProperty("type", "sequence");
          expect(savedSearch).toHaveProperty("status", Constants.SEARCH_PENDING);
          expect(savedSearch).toHaveProperty("hash");

          expect(savedSearch).toHaveProperty("bigsi");
          const bigsi = savedSearch.get("bigsi");

          expect(bigsi).toHaveProperty("type", "sequence");
          expect(bigsi).toHaveProperty("query");
          const query = bigsi.query;
          expect(query.seq).toEqual("GTCAGTCCGTTTGTTCTTGTGGCGAGTGT");
          expect(query.threshold).toEqual(30);

          done();
        });
        it("should set the hash", async done => {
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
          expect(savedSearch.hash).toBeTruthy();
          expect(savedSearch.hash).toEqual(hash);
          done();
        });
      });
      describe("when updating an existing search", () => {
        it("should update core details", async done => {
          const foundSearch = await Search.get(args.id);

          expect(foundSearch.id).toEqual(args.id);
          expect(foundSearch.type).toEqual("sequence");

          foundSearch.set("result", Searches.valid.results.sequence);

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
  });
  describe("#updateAndSetExpiry", () => {
    describe("when valid", () => {
      describe("when not providing a TTL", () => {
        it("should save with the default TTL", async done => {
          const foundSearch = await Search.get(args.id);
          const hash = foundSearch.hash;

          const updatedSearch = await foundSearch.updateAndSetExpiry({
            ERR017683: {
              percent_kmers_found: 100
            }
          });

          const newExpirationDate = moment();
          newExpirationDate.add(1, "hours");

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
      describe("when providing a TTL", () => {
        it("should save with the overriden TTL", async done => {
          const foundSearch = await Search.get(args.id);
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
    });
  });
  describe("#addUser", () => {
    describe("when valid", () => {
      describe("when the user does not exist", () => {
        it("should add user to the users array", async done => {
          const search = new Search();
          const userData = new User(Users.valid.thomas);
          const user = await userData.save();
          const foundSearch = await Search.get(args.id);

          const updated = await foundSearch.addUser(user);
          expect(updated.get("users").length).toEqual(1);

          expect(updated.users[0].id).toEqual(user.id);
          done();
        });
      });
      describe("when the user does exist", () => {
        it("should leave the user array untouched", async done => {
          const search = new Search();
          const userData = new User(Users.valid.thomas);
          const user = await userData.save();
          const foundSearch = await Search.get(args.id);
          expect(foundSearch.get("users").length).toEqual(0);

          const initialUpdate = await foundSearch.addUser(user);

          expect(initialUpdate.get("users").length).toEqual(1);

          const finalUpdate = await initialUpdate.addUser(user);

          expect(finalUpdate.get("users").length).toEqual(1);

          done();
        });
      });
    });
  });
  describe("#clearUsers", () => {
    it("should clear all the users", async done => {
      const userData = new User(Users.valid.thomas);
      const user = await userData.save();
      const foundSearch = await Search.get(args.id);

      await foundSearch.clearUsers();
      expect(foundSearch.users.length).toEqual(0);
      done();
    });
  });
  describe("#userExists", () => {
    describe("when the user exists", () => {
      it("should return true", async done => {
        const userData = new User(Users.valid.thomas);
        const user = await userData.save();
        const foundSearch = await Search.get(args.id);

        await foundSearch.addUser(user);
        const userExists = foundSearch.userExists(user);

        expect(userExists).toBeTruthy();
        done();
      });
    });
    describe("when the user does not exist", () => {
      it("should return false", async done => {
        const userData = new User(Users.valid.thomas);

        const user = await userData.save();
        const foundSearch = await Search.get(args.id);

        const userExists = foundSearch.userExists(user);

        expect(userExists).toBeFalsy();
        done();
      });
    });
  });
  describe("#get", () => {
    describe("when valid", () => {
      describe("when a search exists with the id", () => {
        it("should return the matching search object", async done => {
          const foundSearch = await Search.get(args.id);
          const bigsi = foundSearch.get("bigsi");

          expect(foundSearch.id).toEqual(args.id);
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
      });
    });
    describe("when not valid", () => {
      describe("when no search matches the id", () => {
        it("should return null", async done => {
          const search = await Search.get("58d3f3795d34d121805fdc61");
          expect(search).toBe(null);
          done();
        });
      });
    });
  });
  describe("#findByHash", () => {
    describe("when valid", () => {
      describe("when a search exists with the hash", () => {
        it("should return the matching search object", async done => {
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
          expect(foundSearch.id).toEqual(args.id);
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
    });
    describe("when not valid", () => {
      describe("when no search matches the hash", () => {
        it("should return null", async done => {
          const search = await Search.findByHash("66b7d7e64871aa9fda1bdc8e88a28df797648");
          expect(search).toBe(null);
          done();
        });
      });
    });
  });
  describe("#isPending", () => {
    describe("when status is pending", () => {
      it("should return true", async done => {
        const search = new Search(Searches.valid.searchOnly.pendingSearch);
        const savedSearch = await search.save();

        expect(savedSearch.isPending()).toEqual(true);

        done();
      });
    });
    describe("when status is complete", () => {
      it("should return false", async done => {
        const search = new Search(Searches.valid.searchOnly.completeSearch);
        const savedSearch = await search.save();

        expect(savedSearch.isPending()).toEqual(false);

        done();
      });
    });
  });
  describe("#isComplete", () => {
    describe("when status is pending", () => {
      it("should return false", async () => {
        const search = new Search(Searches.valid.searchOnly.pendingSearch);
        const savedSearch = await search.save();

        expect(savedSearch.isComplete()).toEqual(false);
      });
    });
    describe("when status is complete", () => {
      it("should return true", async done => {
        const search = new Search(Searches.valid.searchOnly.completeSearch);
        const savedSearch = await search.save();

        expect(savedSearch.isComplete()).toEqual(true);

        done();
      });
    });
  });
  describe("#isExpired", () => {
    describe("when the expiry date has passed", () => {
      it("should return true", async done => {
        const search = new Search(Searches.valid.searchOnly.expiredSearch);
        const savedSearch = await search.save();

        expect(savedSearch.isExpired()).toEqual(true);

        done();
      });
    });
    describe("when the expiry date has not passed", () => {
      it("should return false", async done => {
        const search = new Search(Searches.valid.searchOnly.expiredSearch);
        const expires = moment();
        expires.add(1, "day");
        search.expires = expires.toISOString();

        const savedSearch = await search.save();

        expect(savedSearch.isExpired()).toEqual(false);

        done();
      });
    });
  });
  describe("#toJSON", () => {
    it("should transformed core attributes", async done => {
      const foundSearch = await Search.get(args.id);
      const json = foundSearch.toJSON();

      expect(json).toHaveProperty("type", "sequence");
      expect(json).toHaveProperty("status", Constants.SEARCH_PENDING);
      expect(json.hash).toBeTruthy();

      done();
    });
    it("should transformed bigsi search attributes", async done => {
      const foundSearch = await Search.get(args.id);
      const json = foundSearch.toJSON();

      expect(json).toHaveProperty("bigsi");
      const bigsi = json.bigsi;

      expect(bigsi).toHaveProperty("type", "sequence");

      expect(bigsi).toHaveProperty("query");
      const query = bigsi.query;
      expect(query).toHaveProperty("seq", "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
      expect(query).toHaveProperty("threshold", 90);

      done();
    });
  });
});
