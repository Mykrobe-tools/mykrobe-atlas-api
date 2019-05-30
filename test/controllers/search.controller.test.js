import request from "supertest";
import moment from "moment";
import httpStatus from "http-status";

import Constants from "../../src/server/Constants";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Search from "../../src/server/models/search.model";
import Audit from "../../src/server/models/audit.model";

import { userEventEmitter } from "../../src/server/modules/events";

const app = createApp();

import searches from "../fixtures/searches";
import users from "../fixtures/users";

let token = "123";

let proteinVariantSearchId = null;
let sequenceSearchId = null;

beforeEach(async done => {
  const userData = new User(users.admin);
  const savedUser = await userData.save();

  // sequence search with no results
  const sequenceSearch = new Search(searches.searchOnly.sequence);
  sequenceSearch.users.push(savedUser);
  const savedSequenceSearch = await sequenceSearch.save();
  sequenceSearchId = savedSequenceSearch.id;

  // audit for the sequence search
  const sequenceSearchAudit = new Audit({
    searchId: sequenceSearchId,
    attempts: 1,
    status: "Success"
  });
  await sequenceSearchAudit.save();

  // protein variant search with no results
  const proteinVariantSearch = new Search(searches.searchOnly.proteinVariant);
  const savedProteinVariantSearch = await proteinVariantSearch.save();
  proteinVariantSearchId = savedProteinVariantSearch.id;

  // audit for the protein variant search
  const proteinSearchAudit = new Audit({
    searchId: proteinVariantSearchId,
    attempts: 1,
    status: "Success"
  });
  await proteinSearchAudit.save();

  done();
});
afterEach(async done => {
  await Search.remove({});
  await User.remove({});
  await Audit.remove({});
  done();
});

describe("SearchController", () => {
  describe("# PUT /searches/:id/results", () => {
    describe("when searching by sequence", () => {
      it("should save search result", done => {
        request(app)
          .put(`/searches/${sequenceSearchId}/results`)
          .send(searches.results.sequence)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body).toHaveProperty("data");

            const data = res.body.data;

            expect(data).toHaveProperty("type", "sequence");
            expect(data).toHaveProperty("bigsi");
            const bigsi = data.bigsi;
            expect(bigsi).toHaveProperty("type", "sequence");
            expect(bigsi).toHaveProperty("query");
            const query = bigsi.query;
            expect(query).toHaveProperty("seq", "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA");
            expect(query).toHaveProperty("threshold", 0.9);

            expect(data).toHaveProperty("users");
            expect(data.users.length).toEqual(0);

            expect(data).toHaveProperty("result");

            const container = data.result;
            expect(container).toHaveProperty("result");
            const result = container.result;

            expect(Object.keys(result).length).toEqual(3);

            expect(result.ERR017683.percent_kmers_found).toEqual(100);
            expect(result.ERR1149371.percent_kmers_found).toEqual(90);

            done();
          });
      });
      it("should clear the list of users", done => {
        request(app)
          .put(`/searches/${sequenceSearchId}/results`)
          .send(searches.results.sequence)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body).toHaveProperty("data");

            const data = res.body.data;

            expect(data).toHaveProperty("users");
            expect(data.users.length).toEqual(0);

            done();
          });
      });
      it("should set the status to complete", done => {
        request(app)
          .put(`/searches/${sequenceSearchId}/results`)
          .send(searches.results.sequence)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body).toHaveProperty("data");

            const data = res.body.data;

            expect(data).toHaveProperty("status", Constants.SEARCH_COMPLETE);

            done();
          });
      });
      it("should update the expiration date", done => {
        request(app)
          .put(`/searches/${sequenceSearchId}/results`)
          .send(searches.results.sequence)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body).toHaveProperty("data");

            const data = res.body.data;

            expect(data).toHaveProperty("status", Constants.SEARCH_COMPLETE);

            const foundSearch = await Search.get(sequenceSearchId);

            const newExpirationDate = moment();
            newExpirationDate.add(7, "days");

            const expires = moment(foundSearch.expires);
            expect(expires.date()).toEqual(newExpirationDate.date());
            expect(expires.month()).toEqual(newExpirationDate.month());
            expect(expires.year()).toEqual(newExpirationDate.year());

            done();
          });
      });
      it("should notify all the users", done => {
        const mockCallback = jest.fn();
        userEventEmitter.on("sequence-search-complete", mockCallback);
        request(app)
          .put(`/searches/${sequenceSearchId}/results`)
          .send(searches.results.sequence)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body).toHaveProperty("data");

            const data = res.body.data;

            expect(data).toHaveProperty("status", Constants.SEARCH_COMPLETE);

            expect(mockCallback.mock.calls.length).toEqual(1);
            const calls = mockCallback.mock.calls;

            expect(mockCallback.mock.calls[0].length).toEqual(1);
            const object = mockCallback.mock.calls[0][0];

            expect(object.search.id).toEqual(sequenceSearchId);
            expect(object.user.firstname).toEqual("David");

            done();
          });
      });
      it("should throw an error if the search doesnt exist", done => {
        request(app)
          .put("/searches/56c787ccc67fc16ccc1a5e92/results")
          .send(searches.results.sequence)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Search not found with id 56c787ccc67fc16ccc1a5e92");
            done();
          });
      });
    });
    describe("when searching by protein variant", () => {
      it("should store protein variant results", done => {
        request(app)
          .put(`/searches/${proteinVariantSearchId}/results`)
          .send(searches.results.proteinVariant)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body).toHaveProperty("data");

            const data = res.body.data;
            expect(data).toHaveProperty("type", "protein-variant");
            expect(data).toHaveProperty("bigsi");
            const bigsi = data.bigsi;
            expect(bigsi).toHaveProperty("query");
            const query = bigsi.query;
            expect(query).toHaveProperty("ref", "S");
            expect(query).toHaveProperty("alt", "L");
            expect(query).toHaveProperty("pos", 450);
            expect(query).toHaveProperty("gene", "rpoB");

            expect(data).toHaveProperty("created");
            expect(data).toHaveProperty("modified");
            expect(data).toHaveProperty("users");
            expect(data).toHaveProperty("id");

            expect(data).toHaveProperty("result");
            const container = data.result;
            expect(container).toHaveProperty("received");

            expect(container).toHaveProperty("result");
            const result = container.result;
            expect(Object.keys(result).length).toEqual(6);

            done();
          });
      });
    });
  });
});
