import moment from "moment";
import request from "supertest";
import httpStatus from "http-status";

import { ElasticService } from "makeandship-api-common/lib/modules/elasticsearch/";
import {
  SearchQuery,
  AggregationSearchQuery
} from "makeandship-api-common/lib/modules/elasticsearch/";
import { experimentSearch as experimentSearchSchema } from "mykrobe-atlas-jsonschema";

import Constants from "../../src/server/Constants";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Experiment from "../../src/server/models/experiment.model";
import Search from "../../src/server/models/search.model";

import config from "../../src/config/env/";

import users from "../fixtures/users";
import experiments from "../fixtures/experiments";
import searches from "../fixtures/searches";

const args = {
  app: null,
  token: null,
  isolateId1: null,
  isolateId2: null,
  user: null
};

beforeAll(async () => {
  args.app = await createApp();
});

// constants
const esConfig = { type: "experiment", ...config.elasticsearch };
const elasticService = new ElasticService(esConfig, experimentSearchSchema);

const experimentWithMetadata = new Experiment(experiments.tbUploadMetadataPredictorResults);
const experimentWithChineseMetadata = new Experiment(experiments.tbUploadMetadataChinese);

beforeEach(async done => {
  const userData = new User(users.admin);
  args.user = await userData.save();
  request(args.app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end((err, res) => {
      args.token = res.body.data.access_token;
      done();
    });
});

afterEach(async done => {
  await User.deleteMany({});
  await Search.deleteMany({});
  done();
});

beforeAll(async done => {
  const experiment1 = await experimentWithMetadata.save();
  const experiment2 = await experimentWithChineseMetadata.save();

  const metadata1 = experiment1.get("metadata");
  const metadata2 = experiment2.get("metadata");

  args.isolateId1 = metadata1.sample.isolateId;
  args.isolateId2 = metadata2.sample.isolateId;

  done();
});

afterAll(async done => {
  await Experiment.deleteMany({});
  done();
});

describe("ExperimentController > Elasticsearch", () => {
  describe("GET /experiments/choices", () => {
    describe("when invalid", () => {
      describe("when token is invalid", () => {
        it("should return a not authorised error", done => {
          request(args.app)
            .get("/experiments/choices")
            .set("Authorization", "Bearer INVALID_TOKEN")
            .expect(httpStatus.UNAUTHORIZED)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.message).toEqual("Not Authorised");
              done();
            });
        });
      });
    });
    describe("when valid", () => {
      describe("when not filtered", () => {
        let status = null;
        let data = null;
        beforeEach(done => {
          // mocks/atlas-experiment/_search/POST.4688717e47a0f229dbc00b3bc4956838.mock
          request(args.app)
            .get("/experiments/choices")
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              status = res.body.status;
              data = res.body.data;

              done();
            });
        });
        it("should return success", done => {
          expect(status).toEqual("success");

          done();
        });
        it("should return choices and counts for enums", done => {
          // use country as a sample enum
          expect(data["metadata.sample.countryIsolate"]).toBeTruthy();
          const country = data["metadata.sample.countryIsolate"];

          expect(country).toHaveProperty("choices");
          expect(country.choices.length).toEqual(2);

          country.choices.forEach(country => {
            const key = country.key;
            const count = country.count;
            switch (key) {
              case "India":
                expect(count).toEqual(1);
                break;
              case "China":
                expect(count).toEqual(1);
                break;
            }
          });

          done();
        });
        it("should return choices for susceptibility and resistance", done => {
          // use Rifampicin as a sample enum
          expect(data["results.predictor.susceptibility.Rifampicin.prediction"]).toBeTruthy();
          const susceptibility = data["results.predictor.susceptibility.Rifampicin.prediction"];

          expect(susceptibility).toHaveProperty("choices");
          expect(susceptibility.choices.length).toEqual(1);

          expect(susceptibility.choices[0].key).toEqual("R");
          expect(susceptibility.choices[0].count).toEqual(1);

          done();
        });
        it("should return choices for predictor flags", done => {
          const mdr = data["results.predictor.mdr"];
          const xdr = data["results.predictor.xdr"];

          expect(mdr).toHaveProperty("choices");
          expect(mdr.choices.length).toEqual(1);

          expect(mdr.choices[0].key).toEqual(true);
          expect(mdr.choices[0].count).toEqual(1);

          expect(xdr.choices[0].key).toEqual(false);
          expect(xdr.choices[0].count).toEqual(1);

          done();
        });
        it("should return min and max dates", done => {
          expect(data["metadata.sample.dateArrived"].min).toEqual("2017-11-05T00:00:00.000Z");
          expect(data["metadata.sample.dateArrived"].max).toEqual("2018-09-01T00:00:00.000Z");

          done();
        });
        it("should return min and max floating point numbers (BMI)", done => {
          expect(data["metadata.patient.bmi"].min).toEqual(25.3);
          expect(data["metadata.patient.bmi"].max).toEqual(33.1);
          done();
        });
        it("should return min and max integers (age)", done => {
          expect(data["metadata.patient.age"].min).toEqual(32);
          expect(data["metadata.patient.age"].max).toEqual(43);
          done();
        });
        it("should include the titles", done => {
          expect(data["metadata.phenotyping.gatifloxacin.method"].title).toEqual("Method");
          expect(data["metadata.phenotyping.phenotypeInformationFirstLineDrugs"].title).toEqual(
            "Phenotype Information First Line Drugs"
          );
          expect(data["metadata.treatment.outsideStandardPhaseAmikacin.stop"].title).toEqual(
            "Date stopped"
          );
          expect(data["metadata.patient.diabetic"].title).toEqual("Diabetic");
          expect(data["metadata.phenotyping.pretothionamide.susceptibility"].title).toEqual(
            "Susceptible"
          );
          expect(data["metadata.outcome.whoOutcomeCategory"].title).toEqual("WHO Outcome Category");
          expect(data["metadata.genotyping.hainAm"].title).toEqual("HAIN AM");

          done();
        });
        it("should include the titles array", done => {
          expect(data["metadata.phenotyping.gatifloxacin.method"].titles).toEqual([
            "Metadata",
            "Phenotyping",
            "Gatifloxacin",
            "Method"
          ]);
          expect(data["metadata.phenotyping.phenotypeInformationFirstLineDrugs"].titles).toEqual([
            "Metadata",
            "Phenotyping",
            "Phenotype Information First Line Drugs"
          ]);
          expect(data["metadata.treatment.outsideStandardPhaseAmikacin.stop"].titles).toEqual([
            "Metadata",
            "Treatment",
            "Amikacin",
            "Date stopped"
          ]);
          expect(data["metadata.patient.diabetic"].titles).toEqual([
            "Metadata",
            "Patient",
            "Diabetic"
          ]);
          expect(data["metadata.phenotyping.pretothionamide.susceptibility"].titles).toEqual([
            "Metadata",
            "Phenotyping",
            "Pretothionamide",
            "Susceptible"
          ]);
          expect(data["metadata.outcome.whoOutcomeCategory"].titles).toEqual([
            "Metadata",
            "Outcome",
            "WHO Outcome Category"
          ]);
          expect(data["metadata.genotyping.hainAm"].titles).toEqual([
            "Metadata",
            "Genotyping",
            "HAIN AM"
          ]);

          done();
        });
      });
    });
    describe("when filtered", () => {
      describe("when filtered by keywords", () => {
        let status = null;
        let data = null;
        beforeEach(done => {
          // choices will remove filter attribute (when removed)
          // mocks/atlas-experiment/_search/POST.4688717e47a0f229dbc00b3bc4956838.mock

          // choices will remove filter attribute (when set)
          // mocks/atlas-experiment/_search/POST.3c6669e507bacd6b7850cde557e17323.mock
          request(args.app)
            .get(
              "/experiments/choices?metadata.patient.patientId=9bd049c5-7407-4129-a973-17291ccdd2cc"
            )
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              status = res.body.status;
              data = res.body.data;

              done();
            });
        });
        it("should return success", done => {
          expect(status).toEqual("success");
          done();
        });
        it("should set date ranges based on filters", done => {
          expect(data["metadata.sample.dateArrived"].min).toEqual("2017-11-05T00:00:00.000Z");
          expect(data["metadata.sample.dateArrived"].max).toEqual("2017-11-05T00:00:00.000Z");
          done();
        });
        it("should set integer ranges based on filters", done => {
          expect(data["metadata.patient.age"].min).toEqual(32);
          expect(data["metadata.patient.age"].max).toEqual(32);

          done();
        });
        it("should set float ranges based on filters", done => {
          expect(data["metadata.patient.bmi"].min).toEqual(33.1);
          expect(data["metadata.patient.bmi"].max).toEqual(33.1);
          done();
        });
      });
      describe("when filtered by a search", () => {
        describe("when filtered by a free-text search that matches with case insensitivity", () => {
          let status = null;
          let data = null;
          beforeEach(done => {
            // mocks/atlas-experiment/_search/POST.50fb69570ac3d0df7537032c720f8ed3.mock
            request(args.app)
              .get("/experiments/choices?q=Male")
              .set("Authorization", `Bearer ${args.token}`)
              .expect(httpStatus.OK)
              .end((err, res) => {
                status = res.body.status;
                data = res.body.data;

                done();
              });
          });
          it("should return success", done => {
            expect(status).toEqual("success");

            done();
          });
          it("should set date ranges based on filters", done => {
            expect(data["metadata.sample.dateArrived"].min).toEqual("2017-11-05T00:00:00.000Z");
            expect(data["metadata.sample.dateArrived"].max).toEqual("2018-09-01T00:00:00.000Z");
            done();
          });
          it("should set integer ranges based on filters", done => {
            expect(data["metadata.patient.age"].min).toEqual(32);
            expect(data["metadata.patient.age"].max).toEqual(43);

            done();
          });
          it("should set float ranges based on filters", done => {
            expect(data["metadata.patient.bmi"].min).toEqual(25.3);
            expect(data["metadata.patient.bmi"].max).toEqual(33.1);
            done();
          });
        });
        // TODO: review free-text search approach with fuzziness
        describe("when filtered by a free-text search that matches phrases with fuzziness", () => {
          let status = null;
          let data = null;
          beforeEach(done => {
            // mocks/atlas-experiment/_search/POST.ffe491199a2823aacb1c9a20822eeca3.mock
            request(args.app)
              .get("/experiments/choices?q=Female")
              .set("Authorization", `Bearer ${args.token}`)
              .expect(httpStatus.OK)
              .end((err, res) => {
                status = res.body.status;
                data = res.body.data;

                done();
              });
          });
          it("should return success", done => {
            expect(status).toEqual("success");

            done();
          });
          it("should set date ranges based on filters", done => {
            expect(data["metadata.sample.dateArrived"].min).toEqual("2017-11-05T00:00:00.000Z");
            expect(data["metadata.sample.dateArrived"].max).toEqual("2018-09-01T00:00:00.000Z");
            done();
          });
          it("should set integer ranges based on filters", done => {
            expect(data["metadata.patient.age"].min).toEqual(32);
            expect(data["metadata.patient.age"].max).toEqual(43);

            done();
          });
          it("should set float ranges based on filters", done => {
            expect(data["metadata.patient.bmi"].min).toEqual(25.3);
            expect(data["metadata.patient.bmi"].max).toEqual(33.1);
            done();
          });
        });
      });
      describe("when filtered by bigsi attributes", () => {
        let status = null;
        let data = null;
        beforeEach(done => {
          // choices will remove filter attribute (when removed)
          // mocks/atlas-experiment/_search/POST.4688717e47a0f229dbc00b3bc4956838.mock

          // choices will remove filter attribute (when set)
          // mocks/atlas-experiment/_search/POST.3c6669e507bacd6b7850cde557e17323.mock
          request(args.app)
            .get(
              "/experiments/choices?q=CAGTCCGTTTGTTCT&metadata.patient.patientId=9bd049c5-7407-4129-a973-17291ccdd2cc"
            )
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              status = res.body.status;
              data = res.body.data;

              done();
            });
        });
        it("should return success", done => {
          expect(status).toEqual("success");
          done();
        });
        it("should ignore bigsi clauses and set date ranges based on filters", done => {
          expect(data["metadata.sample.dateArrived"].min).toEqual("2017-11-05T00:00:00.000Z");
          expect(data["metadata.sample.dateArrived"].max).toEqual("2017-11-05T00:00:00.000Z");
          done();
        });
        it("should ignore bigsi clauses and set integer ranges based on filters", done => {
          expect(data["metadata.patient.age"].min).toEqual(32);
          expect(data["metadata.patient.age"].max).toEqual(32);

          done();
        });
        it("should ignore bigsi clauses and set float ranges based on filters", done => {
          expect(data["metadata.patient.bmi"].min).toEqual(33.1);
          expect(data["metadata.patient.bmi"].max).toEqual(33.1);
          done();
        });
      });
    });
  });
  describe("GET /experiments/search", () => {
    describe("when not valid", () => {
      describe("when using an invalid token", () => {
        it("should return an error", done => {
          request(args.app)
            .get("/experiments/search?metadata.smoker=No&metadata.imprisoned=Yes")
            .set("Authorization", "Bearer INVALID_TOKEN")
            .expect(httpStatus.UNAUTHORIZED)
            .end((err, res) => {
              expect(res.body.status).toEqual("error");
              expect(res.body.message).toEqual("Not Authorised");
              done();
            });
        });
      });
    });
    describe("when valid", () => {
      describe("when not filtered", () => {
        let status = null;
        let data = null;
        beforeEach(async done => {
          // mocks/atlas-experiment/_search/POST.41e02ddaf093476691ec5e5d7b1e66e0.mock
          request(args.app)
            .get("/experiments/search")
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              status = res.body.status;
              data = res.body.data;

              done();
            });
        });
        it("should return success", done => {
          expect(status).toEqual("success");

          done();
        });
        it("should return search metadata", () => {
          expect(data).toHaveProperty("pagination");
          expect(data).toHaveProperty("metadata");
          expect(data).toHaveProperty("total", 2);
          expect(data).toHaveProperty("results");
          expect(data).toHaveProperty("search");
        });
        it("should return search results", () => {
          expect(data.results.length).toEqual(2);
          data.results.forEach(result => {
            expect(result).toHaveProperty("metadata");
            expect(result).toHaveProperty("created");
            expect(result).toHaveProperty("modified");
            expect(result).toHaveProperty("relevance");
          });
        });
      });
      describe("when filtered", () => {
        describe("when filtered by metadata", () => {
          let status = null;
          let data = null;
          beforeEach(async done => {
            // mocks/atlas-experiment/_search/POST.20aa703ef9174498f37f7159e801ba4d.mock
            request(args.app)
              .get("/experiments/search?metadata.patient.smoker=Yes&metadata.patient.imprisoned=No")
              .set("Authorization", `Bearer ${args.token}`)
              .expect(httpStatus.OK)
              .end((err, res) => {
                status = res.body.status;
                data = res.body.data;

                done();
              });
          });
          it("should return success", done => {
            expect(status).toEqual("success");

            done();
          });
          it("should return search metadata", () => {
            expect(data).toHaveProperty("pagination");
            expect(data).toHaveProperty("metadata");
            expect(data).toHaveProperty("total", 1);
            expect(data).toHaveProperty("results");
            expect(data).toHaveProperty("search");
          });
          it("should return matching search results", () => {
            expect(data.results.length).toEqual(1);
            data.results.forEach(result => {
              expect(result).toHaveProperty("metadata");
              expect(result.metadata.patient.smoker).toEqual("Yes");
              expect(result.metadata.patient.imprisoned).toEqual("No");
              expect(result).toHaveProperty("created");
              expect(result).toHaveProperty("modified");
              expect(result).toHaveProperty("relevance");
            });
          });
        });
        describe("when filtered by susceptibility", () => {
          let status = null;
          let data = null;
          beforeEach(async done => {
            // mocks/atlas-experiment/_search/POST.c35162290e4c1781766d43eb2e991cf2.mock
            request(args.app)
              .get("/experiments/search?results.predictor.susceptibility.Rifampicin.prediction=R")
              .set("Authorization", `Bearer ${args.token}`)
              .expect(httpStatus.OK)
              .end((err, res) => {
                status = res.body.status;
                data = res.body.data;

                done();
              });
          });
          it("should return success", done => {
            expect(status).toEqual("success");

            done();
          });
          it("should return search metadata", () => {
            expect(data).toHaveProperty("pagination");
            expect(data).toHaveProperty("metadata");
            expect(data).toHaveProperty("total", 1);
            expect(data).toHaveProperty("results");
            expect(data).toHaveProperty("search");
          });
          it("should return matching search results", () => {
            expect(data.results.length).toEqual(1);
            data.results.forEach(result => {
              expect(result).toHaveProperty("metadata");
              expect(result).toHaveProperty("created");
              expect(result).toHaveProperty("modified");
              expect(result).toHaveProperty("relevance");

              expect(result.results.predictor.susceptibility.Rifampicin.prediction).toEqual("R");
            });
          });
        });
        describe("when filtered by predictor flags", () => {
          let status = null;
          let data = null;
          beforeEach(async done => {
            // mocks/atlas-experiment/_search/POST.3930e23f448576dd0da1628dea4a838b.mock
            request(args.app)
              .get("/experiments/search?results.predictor.mdr=true")
              .set("Authorization", `Bearer ${args.token}`)
              .expect(httpStatus.OK)
              .end((err, res) => {
                status = res.body.status;
                data = res.body.data;

                done();
              });
          });
          it("should return success", done => {
            expect(status).toEqual("success");

            done();
          });
          it("should return search metadata", () => {
            expect(data).toHaveProperty("pagination");
            expect(data).toHaveProperty("metadata");
            expect(data).toHaveProperty("total", 1);
            expect(data).toHaveProperty("results");
            expect(data).toHaveProperty("search");
          });
          it("should return matching search results", () => {
            expect(data.results.length).toEqual(1);
            data.results.forEach(result => {
              expect(result).toHaveProperty("metadata");
              expect(result).toHaveProperty("created");
              expect(result).toHaveProperty("modified");
              expect(result).toHaveProperty("relevance");

              expect(result.results.predictor.mdr).toEqual(true);
            });
          });
        });
      });
      describe("when using a free-text search", () => {
        let status = null;
        let data = null;
        beforeEach(async done => {
          // mocks/atlas-experiment/_search/POST.cdfe886982486513ba30bd0641fc339b.mock
          request(args.app)
            .get("/experiments/search?q=insulin")
            .set("Authorization", `Bearer ${args.token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              status = res.body.status;
              data = res.body.data;

              done();
            });
        });
        it("should return success", done => {
          expect(status).toEqual("success");

          done();
        });
        it("should return search metadata", () => {
          expect(data).toHaveProperty("pagination");
          expect(data).toHaveProperty("metadata");
          expect(data).toHaveProperty("total", 1);
          expect(data).toHaveProperty("results");
          expect(data).toHaveProperty("search");
        });
        it("should return matching search results", () => {
          expect(data.results.length).toEqual(1);
          data.results.forEach(result => {
            expect(result).toHaveProperty("metadata");
            expect(result).toHaveProperty("created");
            expect(result).toHaveProperty("modified");
            expect(result).toHaveProperty("relevance");
          });
        });
        it("should set relevance", () => {
          expect(data.metadata.maxRelevance).toEqual(3.7886243);
          data.results.forEach(result => {
            expect(result).toHaveProperty("relevance", 3.7886243);
          });
        });
      });
      describe("when using pagination", () => {
        describe("when controlling pagination", () => {
          let status = null;
          let data = null;
          beforeEach(done => {
            // mocks/atlas-experiment/_search/POST.4a225cfef3805aa3268f67cfa36488a4.mock
            request(args.app)
              .get("/experiments/search?metadata.patient.imprisoned=No&per=10&page=1")
              .set("Authorization", `Bearer ${args.token}`)
              .expect(httpStatus.OK)
              .end((err, res) => {
                status = res.body.status;
                data = res.body.data;

                done();
              });
          });
          it("should return success", () => {
            expect(status).toEqual("success");
          });
          it("should paginate", done => {
            const pagination = data.pagination;
            expect(pagination).toHaveProperty("per", 10);
            expect(pagination).toHaveProperty("pages", 1);
            expect(pagination).toHaveProperty("next", 1);
            expect(pagination).toHaveProperty("page", 1);
            expect(pagination).toHaveProperty("previous", 1);

            done();
          });
        });
        describe("when pagination has multiple pages", () => {
          let status = null;
          let data = null;
          beforeEach(done => {
            // mocks/atlas-experiment/_search/POST.5ad09260988ff3af158764814334dcad.mock
            request(args.app)
              .get("/experiments/search?metadata.patient.imprisoned=No&per=1&page=1")
              .set("Authorization", `Bearer ${args.token}`)
              .expect(httpStatus.OK)
              .end((err, res) => {
                status = res.body.status;
                data = res.body.data;

                done();
              });
          });
          it("should return success", () => {
            expect(status).toEqual("success");
          });
          it("should paginate", done => {
            const pagination = data.pagination;
            expect(pagination).toHaveProperty("per", 1);
            expect(pagination).toHaveProperty("pages", 2);
            expect(pagination).toHaveProperty("next", 2);
            expect(pagination).toHaveProperty("page", 1);
            expect(pagination).toHaveProperty("previous", 1);

            done();
          });
        });
      });
      describe("when sorting", () => {
        describe("when the sort field is not whitelisted", () => {
          it("should not apply a sort", done => {
            request(args.app)
              .get("/experiments/search?sort=invalid.field")
              .set("Authorization", `Bearer ${args.token}`)
              .expect(httpStatus.OK)
              .end((err, res) => {
                expect(res.body.status).toEqual("success");
                expect(res.body.data.results.length).toEqual(2);
                done();
              });
          });
        });
        describe("when the sort field is whitelisted", () => {});
      });
      describe("when searching using bigsi", () => {
        describe("when using a sequence search", () => {
          describe("when not setting a threshold", () => {
            let status = null;
            let data = null;
            beforeEach(done => {
              request(args.app)
                .get("/experiments/search?q=CAGTCCGTTTGTTCT")
                .set("Authorization", `Bearer ${args.token}`)
                .expect(httpStatus.OK)
                .end((err, res) => {
                  status = res.body.status;
                  data = res.body.data;

                  done();
                });
            });
            it("should return success", () => {
              expect(status).toEqual("success");
            });
            it("should return a search object", done => {
              expect(data).toHaveProperty("type", "sequence");

              expect(data).toHaveProperty("bigsi");
              const bigsi = data.bigsi;
              expect(bigsi).toHaveProperty("type", "sequence");
              expect(bigsi).toHaveProperty("query");
              const query = bigsi.query;

              expect(data.id).toBeTruthy();
              done();
            });
            it("should set a default threshold", done => {
              const bigsi = data.bigsi;
              const query = bigsi.query;
              expect(query.threshold).toEqual(40);
              done();
            });
            it("should store a search record in the database", async done => {
              const searchId = data.id;

              const search = await Search.get(searchId);
              expect(search).toHaveProperty("type", "sequence");
              const bigsi = search.get("bigsi");
              const query = bigsi.query;
              expect(query.threshold).toEqual(40);
              done();
            });
            it("should add the user to the list of users to be notified", done => {
              const user = data.users.shift();
              expect(user.firstname).toEqual("David");
              expect(user.lastname).toEqual("Robin");
              expect(user.email).toEqual("admin@nhs.co.uk");
              done();
            });
            it("should set the status to pending", done => {
              expect(data.status).toEqual(Constants.SEARCH_PENDING);
              done();
            });
          });
          describe("when setting a threshold", () => {
            it("should return a search object", done => {
              request(args.app)
                .get("/experiments/search?q=CAGTCCGTTTGTTCT&threshold=80")
                .set("Authorization", `Bearer ${args.token}`)
                .expect(httpStatus.OK)
                .end((err, res) => {
                  expect(res.body.status).toEqual("success");
                  expect(res.body.data.type).toEqual("sequence");
                  expect(res.body.data).toHaveProperty("type", "sequence");

                  expect(res.body.data).toHaveProperty("bigsi");

                  const bigsi = res.body.data.bigsi;
                  expect(bigsi).toHaveProperty("type", "sequence");
                  expect(bigsi).toHaveProperty("query");

                  const query = bigsi.query;
                  expect(query.threshold).toEqual(80);
                  expect(res.body.data.id).toBeTruthy();
                  done();
                });
            });
          });
        });
        describe("when using a protein-variant search", () => {
          let status = null;
          let data = null;

          beforeEach(async done => {
            request(args.app)
              .get("/experiments/search?q=rpoB_S450L")
              .set("Authorization", `Bearer ${args.token}`)
              .expect(httpStatus.OK)
              .end((err, res) => {
                status = res.body.status;
                data = res.body.data;

                done();
              });
          });
          it("should return success", done => {
            expect(status).toEqual("success");
            done();
          });
          it("should return a search object", done => {
            expect(data).toHaveProperty("type", "protein-variant");

            expect(data).toHaveProperty("bigsi");
            const bigsi = data.bigsi;
            expect(bigsi).toHaveProperty("type", "protein-variant");
            expect(bigsi).toHaveProperty("query");
            const query = bigsi.query;
            expect(query.gene).toEqual("rpoB");
            expect(query.ref).toEqual("S");
            expect(query.pos).toEqual(450);
            expect(query.alt).toEqual("L");

            expect(data.id).toBeTruthy();
            done();
          });
        });
      });
    });
  });
  describe("GET /experiments/search", () => {
    beforeEach(async done => {
      const sequenceSearchData = new Search(searches.searchOnly.sequence);
      const expires = moment();
      expires.add(3, "days");
      sequenceSearchData.expires = expires.toDate();

      const result = {
        type: "sequence",
        results: [],
        query: {
          seq: "CAGTCCGTTTGTTCT",
          threshold: 80
        }
      };
      const isolateId1 = args.isolateId1;
      const isolateId2 = args.isolateId2;
      result.results.push({
        "metadata.sample.isolateId": isolateId1,
        percent_kmers_found: 100
      });
      result.results.push({
        "metadata.sample.isolateId": isolateId2,
        percent_kmers_found: 90
      });

      sequenceSearchData.users.push(args.user);
      sequenceSearchData.set("result", result);
      sequenceSearchData.status = Constants.SEARCH_COMPLETE;

      const sequenceSearch = await sequenceSearchData.save();

      done();
    });
    describe("when no additional criteria provided", () => {
      let status = null;
      let data = null;
      beforeEach(done => {
        // mocks/atlas-experiment/_search/POST.f17040a0181759118ca7d33418965d7b.mock
        request(args.app)
          .get("/experiments/search?q=GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA&threshold=90")
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            status = res.body.status;
            data = res.body.data;

            done();
          });
      });
      it("should return success", () => {
        expect(status).toEqual("success");
      });
      it("should inflate results", () => {
        const results = data.results;
        expect(results.length).toEqual(2);

        const result1 = results[0];
        const result2 = results[1];

        expect(result1.id).toBeTruthy();
        expect(result1.metadata).toBeTruthy();
        expect(result1.percent_kmers_found).toBeTruthy();

        expect(result2.id).toBeTruthy();
        expect(result2.metadata).toBeTruthy();
        expect(result2.percent_kmers_found).toBeTruthy();
      });
      it("should run a sequence search", done => {
        expect(data.type).toEqual("sequence");
        expect(data.bigsi).toBeTruthy();
        expect(data.users).toBeTruthy();
        expect(data.results).toBeTruthy();
        expect(data.type).toEqual("sequence");

        done();
      });
    });
    describe("when additional criteria provided", () => {
      let status = null;
      let data = null;
      beforeEach(done => {
        // mocks/atlas-experiment/_search/POST.d19a299a334fca941c4bba0dcb615ff9.mock
        request(args.app)
          .get(
            "/experiments/search?q=GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA&threshold=90&metadata.patient.smoker=No"
          )
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            status = res.body.status;
            data = res.body.data;

            done();
          });
      });
      it("should return success", done => {
        expect(status).toEqual("success");

        done();
      });
      it("should run a sequence search", done => {
        expect(data.type).toEqual("sequence");
        expect(data.bigsi).toBeTruthy();
        expect(data.users).toBeTruthy();
        expect(data.results).toBeTruthy();
        expect(data.type).toEqual("sequence");

        done();
      });
      it("should inflate search results", done => {
        const results = data.results;
        expect(results.length).toEqual(1);

        const result = results[0];

        expect(result.id).toBeTruthy();
        expect(result.metadata).toBeTruthy();
        expect(result.metadata.patient.smoker).toEqual("No");
        expect(result.percent_kmers_found).toEqual(90);
        done();
      });
      it("should filter search results", done => {
        const result = data.results[0];

        expect(result.metadata.patient.smoker).toEqual("No");
        done();
      });
    });
    describe("when no results", () => {
      let status = null;
      let data = null;
      beforeEach(done => {
        // mocks/atlas-experiment/_search/POST.f7727e8fb312a5601d06ac318674b0f0.mock
        request(args.app)
          .get(
            "/experiments/search?q=GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA&threshold=90&metadata.patient.smoker=Y"
          )
          .set("Authorization", `Bearer ${args.token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            status = res.body.status;
            data = res.body.data;

            done();
          });
      });
      it("should return success", done => {
        expect(status).toEqual("success");
        done();
      });
      it("should return no results", done => {
        expect(data.type).toEqual("sequence");
        expect(data.bigsi).toBeTruthy();
        expect(data.users).toBeTruthy();
        expect(data.results).toBeTruthy();
        expect(data.type).toEqual("sequence");

        const results = data.results;
        expect(results.length).toEqual(0);

        done();
      });
    });
  });
});
