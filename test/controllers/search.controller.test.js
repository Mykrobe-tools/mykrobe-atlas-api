import request from "supertest";
import moment from "moment";
import httpStatus from "http-status";

import Constants from "../../src/server/Constants";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Search from "../../src/server/models/search.model";
import Audit from "../../src/server/models/audit.model";

import { userEventEmitter } from "../../src/server/modules/events";

import searches from "../fixtures/searches";
import users from "../fixtures/users";

const args = {
  app: null,
  token: null,
  dnaVariantSearchId: null,
  proteinVariantSearchId: null,
  sequenceSearchId: null
};

beforeAll(async () => {
  args.app = await createApp();
});

beforeEach(async done => {
  const userData = new User(users.admin);
  const savedUser = await userData.save();

  // sequence search with no results
  const sequenceSearch = new Search(searches.searchOnly.sequence);
  sequenceSearch.users.push(savedUser);
  const savedSequenceSearch = await sequenceSearch.save();
  args.sequenceSearchId = savedSequenceSearch.id;

  // audit for the sequence search
  const sequenceSearchAudit = new Audit({
    searchId: args.sequenceSearchId,
    attempts: 1,
    status: "Success"
  });
  await sequenceSearchAudit.save();

  // protein variant search with no results
  const proteinVariantSearch = new Search(searches.searchOnly.proteinVariant);
  proteinVariantSearch.users.push(savedUser);
  const savedProteinVariantSearch = await proteinVariantSearch.save();
  args.proteinVariantSearchId = savedProteinVariantSearch.id;

  // audit for the protein variant search
  const proteinSearchAudit = new Audit({
    searchId: args.proteinVariantSearchId,
    attempts: 1,
    status: "Success"
  });
  await proteinSearchAudit.save();

  // dna variant search with no results
  const dnaVariantSearch = new Search(searches.searchOnly.dnaVariant);
  dnaVariantSearch.users.push(savedUser);
  const savedDnaVariantSearch = await dnaVariantSearch.save();
  args.dnaVariantSearchId = savedDnaVariantSearch.id;

  // audit for the protein variant search
  const dnaSearchAudit = new Audit({
    searchId: args.dnaVariantSearchId,
    attempts: 1,
    status: "Success"
  });
  await dnaSearchAudit.save();

  request(args.app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end((err, res) => {
      args.token = res.body.data.access_token;
      done();
    });
});
afterEach(async done => {
  await Search.deleteMany({});
  await User.deleteMany({});
  await Audit.deleteMany({});
  done();
});

describe("SearchController", () => {
  describe("PUT /searches/:id/results", () => {
    describe("when the search id is not valid", () => {
      it("should return an error an error", done => {
        request(args.app)
          .put("/searches/56c787ccc67fc16ccc1a5e92/results")
          .set("Authorization", `Bearer ${args.token}`)
          .send(searches.results.sequence)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Search not found with id 56c787ccc67fc16ccc1a5e92");
            done();
          });
      });
    });
    describe("when the search id is valid", () => {
      describe("when searching by sequence", () => {
        describe("when results are returned", () => {
          let body = null;
          let calls = null;
          let notification = null;

          beforeEach(done => {
            const mockCallback = jest.fn();
            userEventEmitter.on("sequence-search-complete", mockCallback);
            request(args.app)
              .put(`/searches/${args.sequenceSearchId}/results`)
              .set("Authorization", `Bearer ${args.token}`)
              .send(searches.results.sequence)
              .expect(httpStatus.OK)
              .end((err, res) => {
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("data");

                body = res.body;

                expect(mockCallback.mock.calls.length).toEqual(1);
                calls = mockCallback.mock.calls;

                expect(mockCallback.mock.calls[0].length).toEqual(1);
                notification = mockCallback.mock.calls[0][0];

                done();
              });
          });
          afterEach(done => {
            userEventEmitter.removeAllListeners(["sequence-search-complete"]);
            done();
          });
          it("should be successful", done => {
            expect(body).toHaveProperty("status", "success");
            done();
          });
          it("should return a bigsi search", done => {
            expect(body).toHaveProperty("data");

            const data = body.data;

            expect(data).toHaveProperty("type", "sequence");
            expect(data).toHaveProperty("bigsi");

            const bigsi = data.bigsi;
            expect(bigsi).toHaveProperty("type", "sequence");
            expect(bigsi).toHaveProperty("query");

            const query = bigsi.query;
            expect(query).toHaveProperty("seq", "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
            expect(query).toHaveProperty("threshold", 90);

            done();
          });
          it("should return a freetext search query", done => {
            expect(body).toHaveProperty("data");

            const data = body.data;

            expect(data).toHaveProperty("bigsi");
            const bigsi = data.bigsi;
            expect(bigsi).toHaveProperty("search");

            const search = bigsi.search;
            expect(search).toHaveProperty("q", "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");

            done();
          });
          it("should clear waiting users", done => {
            const data = body.data;

            expect(data).toHaveProperty("users");
            expect(data.users.length).toEqual(0);
            done();
          });
          it("should return results", done => {
            const data = body.data;

            expect(data).toHaveProperty("results");
            expect(data.results.length).toEqual(3);

            done();
          });
          it("should return result isolate ids", done => {
            const data = body.data;
            data.results.forEach(result => {
              const sampleId = result.sampleId;
              const kmers = result.percentKmersFound;

              switch (sampleId) {
                case "ERR017683":
                  expect(kmers).toEqual(100);
                  break;
                case "ERR1149371":
                  expect(kmers).toEqual(90);
                  break;
                case "ERR1163331":
                  expect(kmers).toEqual(100);
                  break;
              }
            });
            done();
          });
          it("should save search result", async done => {
            const search = await Search.get(args.sequenceSearchId);
            const searchObject = search.toObject();

            expect(searchObject).toHaveProperty("result");
            expect(searchObject.result).toHaveProperty("type", "sequence");
            expect(searchObject.result).toHaveProperty("results");
            expect(searchObject.result.results.length).toEqual(3);

            done();
          });
          it("should set the status to complete", done => {
            const data = body.data;

            expect(data).toHaveProperty("status", Constants.SEARCH_COMPLETE);

            done();
          });
          it("should update the expiration date", async done => {
            const data = body.data;

            expect(data).toHaveProperty("status", Constants.SEARCH_COMPLETE);

            const foundSearch = await Search.get(args.sequenceSearchId);

            const newExpirationDate = moment();
            newExpirationDate.add(1, "hours");

            const expires = moment(foundSearch.expires);
            expect(expires.date()).toEqual(newExpirationDate.date());
            expect(expires.month()).toEqual(newExpirationDate.month());
            expect(expires.year()).toEqual(newExpirationDate.year());

            done();
          });
          it("should notify all the users", done => {
            expect(notification.search.id).toEqual(args.sequenceSearchId);
            expect(notification.user.firstname).toEqual("David");

            done();
          });
          it("should show the query in each notification", done => {
            // regenerated bigsi search query
            expect(notification.search.bigsi).toHaveProperty("search");
            expect(notification.search.bigsi.search).toHaveProperty(
              "q",
              "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA"
            );

            done();
          });
        });
        describe("when empty results are returned", () => {
          let body = null;
          let calls = null;
          let notification = null;

          beforeEach(done => {
            const mockCallback = jest.fn();
            userEventEmitter.on("sequence-search-complete", mockCallback);
            request(args.app)
              .put(`/searches/${args.sequenceSearchId}/results`)
              .set("Authorization", `Bearer ${args.token}`)
              .send(searches.results.emptySequence)
              .expect(httpStatus.OK)
              .end((err, res) => {
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("data");

                body = res.body;

                expect(mockCallback.mock.calls.length).toEqual(1);
                calls = mockCallback.mock.calls;

                expect(mockCallback.mock.calls[0].length).toEqual(1);
                notification = mockCallback.mock.calls[0][0];

                done();
              });
          });
          afterEach(done => {
            userEventEmitter.removeAllListeners(["sequence-search-complete"]);
            done();
          });
          it("should be successful", done => {
            expect(body).toHaveProperty("status", "success");
            done();
          });
          it("should return 0 results", done => {
            const data = body.data;

            expect(data).toHaveProperty("results");
            expect(data.results.length).toEqual(0);

            done();
          });
          it("should set the status to complete", done => {
            const data = body.data;

            expect(data).toHaveProperty("status", Constants.SEARCH_COMPLETE);

            done();
          });
        });
      });
      describe("when searching by protein variant", () => {
        let body = null;
        let calls = null;
        let notification = null;
        beforeEach(done => {
          const mockCallback = jest.fn();
          userEventEmitter.on("protein-variant-search-complete", mockCallback);
          request(args.app)
            .put(`/searches/${args.proteinVariantSearchId}/results`)
            .set("Authorization", `Bearer ${args.token}`)
            .send(searches.results.proteinVariant)
            .expect(httpStatus.OK)
            .end((err, res) => {
              body = res.body;

              expect(mockCallback.mock.calls.length).toEqual(1);
              calls = mockCallback.mock.calls;

              expect(mockCallback.mock.calls[0].length).toEqual(1);
              notification = mockCallback.mock.calls[0][0];

              done();
            });
        });

        afterEach(done => {
          userEventEmitter.removeAllListeners(["protein-variant-search-complete"]);
          done();
        });

        it("should be successful", done => {
          expect(body).toHaveProperty("status", "success");
          done();
        });
        it("should return a bigsi search", done => {
          expect(body).toHaveProperty("data");

          const data = body.data;

          expect(data).toHaveProperty("type", "protein-variant");
          expect(data).toHaveProperty("bigsi");

          const bigsi = data.bigsi;
          expect(bigsi).toHaveProperty("query");

          const query = bigsi.query;
          expect(query).toHaveProperty("ref", "S");
          expect(query).toHaveProperty("alt", "L");
          expect(query).toHaveProperty("pos", 450);
          expect(query).toHaveProperty("gene", "rpoB");

          done();
        });
        it("should return search attributes", done => {
          const data = body.data;
          expect(data).toHaveProperty("created");
          expect(data).toHaveProperty("modified");
          expect(data).toHaveProperty("users");
          expect(data).toHaveProperty("id");
          done();
        });
        it("should return a freetext search query", done => {
          expect(body).toHaveProperty("data");

          const data = body.data;

          expect(data).toHaveProperty("bigsi");
          const bigsi = data.bigsi;

          expect(bigsi).toHaveProperty("search");
          expect(bigsi.search).toHaveProperty("q", "rpoB_S450L");
          done();
        });
        it("should clear waiting users", done => {
          const data = body.data;

          expect(data).toHaveProperty("users");
          expect(data.users.length).toEqual(0);
          done();
        });
        it("should return results", done => {
          const data = body.data;

          expect(data).toHaveProperty("results");
          expect(data.results.length).toEqual(2);

          done();
        });
        it("should return result isolate ids", done => {
          const data = body.data;
          data.results.forEach(entry => {
            const sampleId = entry.sampleId;
            const genotype = entry.genotype;

            expect(["HN081", "SAMN06192378"].includes(sampleId)).toEqual(true);
            expect(genotype).toEqual("1/1");
          });
          done();
        });
        it("should save search result", async done => {
          const search = await Search.get(args.proteinVariantSearchId);
          const searchObject = search.toObject();

          expect(searchObject).toHaveProperty("result");
          expect(searchObject.result).toHaveProperty("type", "protein-variant");
          expect(searchObject.result).toHaveProperty("results");
          expect(searchObject.result.results.length).toEqual(2);

          done();
        });
        it("should set the status to complete", done => {
          const data = body.data;

          expect(data).toHaveProperty("status", Constants.SEARCH_COMPLETE);

          done();
        });
        it("should notify all the users", done => {
          expect(notification.search.id).toEqual(args.proteinVariantSearchId);
          expect(notification.user.firstname).toEqual("David");

          done();
        });
        it("should show the query in each notification", done => {
          // regenerated bigsi search query
          expect(notification.search.bigsi).toHaveProperty("search");
          expect(notification.search.bigsi.search).toHaveProperty("q", "rpoB_S450L");

          done();
        });
      });
      describe("when searching by dna variant", () => {
        let body = null;
        let calls = null;
        let notification = null;
        beforeEach(done => {
          const mockCallback = jest.fn();
          userEventEmitter.on("dna-variant-search-complete", mockCallback);
          request(args.app)
            .put(`/searches/${args.dnaVariantSearchId}/results`)
            .set("Authorization", `Bearer ${args.token}`)
            .send(searches.results.dnaVariant)
            .expect(httpStatus.OK)
            .end((err, res) => {
              body = res.body;

              expect(mockCallback.mock.calls.length).toEqual(1);
              calls = mockCallback.mock.calls;

              expect(mockCallback.mock.calls[0].length).toEqual(1);
              notification = mockCallback.mock.calls[0][0];

              done();
            });
        });

        afterEach(done => {
          userEventEmitter.removeAllListeners(["dna-variant-search-complete"]);
          done();
        });

        it("should be successful", done => {
          expect(body).toHaveProperty("status", "success");
          done();
        });

        it("should return a bigsi search", done => {
          expect(body).toHaveProperty("data");

          const data = body.data;

          expect(data).toHaveProperty("type", "dna-variant");
          expect(data).toHaveProperty("bigsi");

          const bigsi = data.bigsi;
          expect(bigsi).toHaveProperty("query");

          const query = bigsi.query;
          expect(query).toHaveProperty("ref", "G");
          expect(query).toHaveProperty("alt", "C");
          expect(query).toHaveProperty("pos", 4346385);

          done();
        });
        it("should return search attributes", done => {
          const data = body.data;
          expect(data).toHaveProperty("created");
          expect(data).toHaveProperty("modified");
          expect(data).toHaveProperty("users");
          expect(data).toHaveProperty("id");
          done();
        });
        it("should return a freetext search query", done => {
          expect(body).toHaveProperty("data");

          const data = body.data;

          expect(data).toHaveProperty("bigsi");
          const bigsi = data.bigsi;

          expect(bigsi).toHaveProperty("search");
          expect(bigsi.search).toHaveProperty("q", "G4346385C");
          done();
        });
        it("should clear waiting users", done => {
          const data = body.data;

          expect(data).toHaveProperty("users");
          expect(data.users.length).toEqual(0);
          done();
        });
        it("should return results", done => {
          const data = body.data;

          expect(data).toHaveProperty("results");
          expect(data.results.length).toEqual(2);

          done();
        });
        it("should return result isolate ids", done => {
          const data = body.data;
          data.results.forEach(entry => {
            const sampliId = entry.sampleId;
            const genotype = entry.genotype;

            expect(["HN079", "SAMN06092584"].includes(sampliId)).toEqual(true);
            expect(genotype).toEqual("1/1");
          });
          done();
        });
        it("should save search result", async done => {
          const search = await Search.get(args.dnaVariantSearchId);
          const searchObject = search.toObject();

          expect(searchObject).toHaveProperty("result");
          expect(searchObject.result).toHaveProperty("type", "dna-variant");
          expect(searchObject.result).toHaveProperty("results");
          expect(searchObject.result.results.length).toEqual(2);

          done();
        });
        it("should set the status to complete", done => {
          const data = body.data;

          expect(data).toHaveProperty("status", Constants.SEARCH_COMPLETE);

          done();
        });
        it("should notify all the users", done => {
          expect(notification.search.id).toEqual(args.dnaVariantSearchId);
          expect(notification.user.firstname).toEqual("David");

          done();
        });
        it("should show the query in each notification", done => {
          // regenerated bigsi search query
          expect(notification.search.bigsi).toHaveProperty("search");
          expect(notification.search.bigsi.search).toHaveProperty("q", "G4346385C");

          done();
        });
      });
    });
  });
});
