import request from "supertest";
import httpStatus from "http-status";

import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch";
import { experiment as experimentSchema } from "mykrobe-atlas-jsonschema";

import { createApp } from "../setup";

import User from "../../src/server/models/user.model";
import Experiment from "../../src/server/models/experiment.model";
import Search from "../../src/server/models/search.model";

import config from "../../src/config/env/";

import users from "../fixtures/users";
import experiments from "../fixtures/experiments";
import searches from "../fixtures/searches";

const app = createApp();

let token = null;

const experimentWithMetadata = new Experiment(experiments.tbUploadMetadata);
const experimentWithChineseMetadata = new Experiment(experiments.tbUploadMetadataChinese);

let isolateId1,
  isolateId2 = null;

let savedUser = null;

beforeEach(async done => {
  const userData = new User(users.admin);
  savedUser = await userData.save();
  request(app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end((err, res) => {
      token = res.body.data.access_token;
      done();
    });
});

afterEach(async done => {
  await User.remove({});
  await Search.remove({});
  done();
});

beforeAll(async done => {
  await ElasticsearchHelper.deleteIndexIfExists(config);
  await ElasticsearchHelper.createIndex(config, experimentSchema, "experiment");

  const experiment1 = await experimentWithMetadata.save();
  const experiment2 = await experimentWithChineseMetadata.save();

  const metadata1 = experiment1.get("metadata");
  const metadata2 = experiment2.get("metadata");

  isolateId1 = metadata1.sample.isolateId;
  isolateId2 = metadata2.sample.isolateId;

  // index to elasticsearch
  const experiments = await Experiment.list();
  await ElasticsearchHelper.indexDocuments(config, experiments, "experiment");
  let data = await ElasticsearchHelper.search(config, {}, "experiment");
  while (data.hits.total < 2) {
    data = await ElasticsearchHelper.search(config, {}, "experiment");
  }
  console.log(`local data created`);
  done();
}, 60000);

afterAll(async done => {
  await ElasticsearchHelper.deleteIndexIfExists(config);
  await ElasticsearchHelper.createIndex(config, experimentSchema, "experiment");
  await Experiment.remove({});
  done();
});

describe("ExperimentController > Elasticsearch", () => {
  describe("# GET /experiments/choices", () => {
    it("should return choices and counts for enums", done => {
      request(app)
        .get("/experiments/choices")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;

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
    });
    it("should return min and max dates", done => {
      request(app)
        .get("/experiments/choices")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;

          expect(data["metadata.sample.dateArrived"].min).toEqual("2017-11-05T00:00:00.000Z");
          expect(data["metadata.sample.dateArrived"].max).toEqual("2018-09-01T00:00:00.000Z");
          done();
        });
    });
    it("should include the titles", done => {
      request(app)
        .get("/experiments/choices")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;

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
    });
    it("should include the titles array", done => {
      request(app)
        .get("/experiments/choices")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;

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
          expect(data["results.kmer"].titles).toEqual(["Results", "K-mer"]);

          done();
        });
    });
    it("should return min and max bmi values", done => {
      request(app)
        .get("/experiments/choices")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;
          expect(data["metadata.patient.bmi"].min).toEqual(25.3);
          expect(data["metadata.patient.bmi"].max).toEqual(33.1);
          done();
        });
    });
    it("should return min and max patient age", done => {
      request(app)
        .get("/experiments/choices")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;
          expect(data["metadata.patient.age"].min).toEqual(32);
          expect(data["metadata.patient.age"].max).toEqual(43);
          done();
        });
    });
    it("should filter the choices", done => {
      request(app)
        .get("/experiments/choices?metadata.patient.patientId=9bd049c5-7407-4129-a973-17291ccdd2cc")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const data = res.body.data;

          expect(data["metadata.patient.age"].min).toEqual(32);
          expect(data["metadata.patient.age"].max).toEqual(32);
          expect(data["metadata.patient.bmi"].min).toEqual(33.1);
          expect(data["metadata.patient.bmi"].max).toEqual(33.1);
          expect(data["metadata.sample.dateArrived"].min).toEqual("2017-11-05T00:00:00.000Z");
          expect(data["metadata.sample.dateArrived"].max).toEqual("2017-11-05T00:00:00.000Z");

          done();
        });
    });
    it("should apply a free text query to choices - male", done => {
      request(app)
        .get("/experiments/choices?q=Male")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");

          const data = res.body.data;
          expect(data["metadata.patient.age"].min).toEqual(32);
          expect(data["metadata.patient.age"].max).toEqual(43);
          expect(data["metadata.patient.bmi"].min).toEqual(25.3);
          expect(data["metadata.patient.bmi"].max).toEqual(33.1);
          expect(data["metadata.sample.dateArrived"].min).toEqual("2017-11-05T00:00:00.000Z");
          expect(data["metadata.sample.dateArrived"].max).toEqual("2018-09-01T00:00:00.000Z");

          done();
        });
    });
    it("should apply a free text query to choices - female", done => {
      request(app)
        .get("/experiments/choices?q=Female")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");

          const data = res.body.data;
          expect(data["metadata.patient.age"].min).toEqual(32);
          expect(data["metadata.patient.age"].max).toEqual(32);
          expect(data["metadata.patient.bmi"].min).toEqual(33.1);
          expect(data["metadata.patient.bmi"].max).toEqual(33.1);
          expect(data["metadata.sample.dateArrived"].min).toEqual("2017-11-05T00:00:00.000Z");
          expect(data["metadata.sample.dateArrived"].max).toEqual("2017-11-05T00:00:00.000Z");

          done();
        });
    });
    it("should apply case insensitive free text query to choices", done => {
      request(app)
        .get("/experiments/choices?q=INSU")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");

          const data = res.body.data;
          expect(data["metadata.patient.diabetic"].choices[0].key).toEqual("Insulin");
          expect(data["metadata.genotyping.genexpert"].choices[0].key).toEqual("Not tested");
          expect(data["metadata.patient.age"].max).toEqual(43);
          expect(data["metadata.patient.bmi"].min).toEqual(25.3);
          expect(data["metadata.sample.dateArrived"].min).toEqual("2018-09-01T00:00:00.000Z");

          done();
        });
    });
    it("should apply case insensitive free text query to choices", done => {
      request(app)
        .get("/experiments/choices?q=nSuL")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");

          const data = res.body.data;
          expect(data["metadata.patient.diabetic"].choices[0].key).toEqual("Insulin");
          expect(data["metadata.genotyping.genexpert"].choices[0].key).toEqual("Not tested");
          expect(data["metadata.patient.age"].max).toEqual(43);
          expect(data["metadata.patient.bmi"].min).toEqual(25.3);
          expect(data["metadata.sample.dateArrived"].min).toEqual("2018-09-01T00:00:00.000Z");

          done();
        });
    });
    it("should apply partial match free text queries", done => {
      request(app)
        .get("/experiments/choices?q=emale")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          expect(res.body.status).toEqual("success");

          const data = res.body.data;
          expect(data["metadata.patient.age"].min).toEqual(32);
          expect(data["metadata.patient.age"].max).toEqual(32);
          expect(data["metadata.patient.bmi"].min).toEqual(33.1);
          expect(data["metadata.patient.bmi"].max).toEqual(33.1);
          expect(data["metadata.sample.dateArrived"].min).toEqual("2017-11-05T00:00:00.000Z");
          expect(data["metadata.sample.dateArrived"].max).toEqual("2017-11-05T00:00:00.000Z");

          done();
        });
    });
    it("should be a protected route", done => {
      request(app)
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
  describe("# GET /experiments/search", () => {
    it("should return experiment results", done => {
      request(app)
        .get("/experiments/search")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("pagination");
          expect(res.body.data).toHaveProperty("metadata");
          expect(res.body.data).toHaveProperty("total", 2);
          expect(res.body.data).toHaveProperty("results");
          expect(res.body.data.results.length).toEqual(2);
          expect(res.body.data).toHaveProperty("search");

          res.body.data.results.forEach(result => {
            expect(result).toHaveProperty("metadata");
            expect(result).toHaveProperty("created");
            expect(result).toHaveProperty("modified");
            expect(result).toHaveProperty("relevance");
          });

          done();
        });
    });
    it("should filter by metadata fields", done => {
      request(app)
        .get("/experiments/search?metadata.patient.smoker=Yes&metadata.patient.imprisoned=No")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("total", 1);
          expect(res.body.data).toHaveProperty("results");
          expect(res.body.data.results.length).toEqual(1);
          done();
        });
    });
    it("should apply a free text search query", done => {
      request(app)
        .get("/experiments/search?q=Female")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("total", 1);
          expect(res.body.data).toHaveProperty("results");
          expect(res.body.data.results.length).toEqual(1);
          expect(res.body.data).toHaveProperty("search");
          expect(res.body.data.search).toHaveProperty("q", "Female");
          done();
        });
    });
    it("should partial match free text search queries", done => {
      request(app)
        .get("/experiments/search?q=emale")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("total", 1);
          expect(res.body.data).toHaveProperty("results");
          expect(res.body.data.results.length).toEqual(1);
          expect(res.body.data).toHaveProperty("search");
          expect(res.body.data.search).toHaveProperty("q", "emale");
          done();
        });
    });
    it("should support case-insensitive free text search queries", done => {
      request(app)
        .get("/experiments/search?q=INSUL")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const result = res.body.data.results[0];

          expect(result.metadata.patient.diabetic).toEqual("Insulin");
          expect(result.metadata.patient.age).toEqual(43);
          expect(result.metadata.sample.labId).toEqual("d19637ed-e5b4-4ca7-8418-8713646a3359");

          done();
        });
    });
    it("should support case-insensitive free text search queries", done => {
      request(app)
        .get("/experiments/search?q=nSuL")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const result = res.body.data.results[0];

          expect(result.metadata.patient.diabetic).toEqual("Insulin");
          expect(result.metadata.patient.age).toEqual(43);
          expect(result.metadata.sample.labId).toEqual("d19637ed-e5b4-4ca7-8418-8713646a3359");

          done();
        });
    });
    it("should apply a free text search query with filters", done => {
      request(app)
        .get("/experiments/search?metadata.patient.smoker=No&q=Female")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("total", 1);
          expect(res.body.data).toHaveProperty("results");
          expect(res.body.data.results.length).toEqual(1);
          expect(res.body.data).toHaveProperty("search");
          expect(res.body.data.search).toHaveProperty("q", "Female");
          expect(res.body.data.search["metadata.patient.smoker"]).toEqual("No");

          done();
        });
    });
    it("should include a summary", done => {
      request(app)
        .get("/experiments/search?metadata.patient.smoker=Yes&metadata.patient.imprisoned=No")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("total", 1);
          expect(res.body.data).toHaveProperty("results");
          expect(res.body.data.results.length).toEqual(1);
          done();
        });
    });
    it("should be a protected route", done => {
      request(app)
        .get("/experiments/search?metadata.smoker=No&metadata.imprisoned=Yes")
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
    it("should allow pagination", done => {
      request(app)
        .get("/experiments/search?metadata.patient.imprisoned=No&per=10&page=1")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("pagination");
          expect(res.body.data).toHaveProperty("metadata");
          expect(res.body.data).toHaveProperty("total");
          expect(res.body.data).toHaveProperty("results");
          expect(res.body.data).toHaveProperty("search");

          const pagination = res.body.data.pagination;
          expect(pagination).toHaveProperty("per", 10);
          expect(pagination).toHaveProperty("pages", 1);
          expect(pagination).toHaveProperty("next", 1);
          expect(pagination).toHaveProperty("page", 1);
          expect(pagination).toHaveProperty("previous", 1);

          done();
        });
    });
    it("should allow paginate over multiple pages", done => {
      request(app)
        .get("/experiments/search?metadata.patient.imprisoned=No&per=1&page=1")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("pagination");
          expect(res.body.data).toHaveProperty("metadata");
          expect(res.body.data).toHaveProperty("total");
          expect(res.body.data).toHaveProperty("results");
          expect(res.body.data).toHaveProperty("search");

          const pagination = res.body.data.pagination;
          expect(pagination).toHaveProperty("per", 1);
          expect(pagination).toHaveProperty("pages", 2);
          expect(pagination).toHaveProperty("next", 2);
          expect(pagination).toHaveProperty("page", 1);
          expect(pagination).toHaveProperty("previous", 1);

          done();
        });
    });
    it("should only sort by whitelisted fields", done => {
      request(app)
        .get("/experiments/search?sort=invalid.field")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.results.length).toEqual(2);
          done();
        });
    });
    describe("when running bigsi searches", () => {
      it("should return a search object for sequence search - threshold", done => {
        request(app)
          .get("/experiments/search?q=CAGTCCGTTTGTTCT")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.type).toEqual("sequence");
            expect(res.body.data.bigsi.threshold).toEqual(1);
            expect(res.body.data.id).toBeTruthy();
            done();
          });
      });
      it("should return a search object for sequence search - no threshold", done => {
        request(app)
          .get("/experiments/search?q=CAGTCCGTTTGTTCT&threshold=0.8")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.type).toEqual("sequence");
            expect(res.body.data.bigsi.threshold).toEqual(0.8);
            expect(res.body.data.id).toBeTruthy();
            done();
          });
      });
      it("should return a result_id for protein variant search", done => {
        request(app)
          .get("/experiments/search?q=rpoB_S450L")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.type).toEqual("protein-variant");
            expect(res.body.data.bigsi.gene).toEqual("rpoB");
            expect(res.body.data.bigsi.ref).toEqual("S");
            expect(res.body.data.bigsi.pos).toEqual(450);
            expect(res.body.data.bigsi.alt).toEqual("L");
            expect(res.body.data.id).toBeTruthy();
            done();
          });
      });
      it("should save search in mongo", done => {
        request(app)
          .get("/experiments/search?q=CAGTCCGTTTGTTCT&threshold=0.8")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const searchId = res.body.data.id;
            const search = await Search.get(searchId);
            expect(search.type).toEqual("sequence");
            const bigsi = search.get("bigsi");
            expect(bigsi.threshold).toEqual(0.8);
            done();
          });
      });
      it("should add the user to the list of users to be notified", done => {
        request(app)
          .get("/experiments/search?q=CAGTCCGTTTGTTCT")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.type).toEqual("sequence");
            expect(res.body.data.bigsi.threshold).toEqual(1);
            expect(res.body.data.id).toBeTruthy();
            expect(res.body.data.users.length).toEqual(1);
            expect(res.body.data.users[0].firstname).toEqual("David");
            done();
          });
      });
      it("should set the status to pending", done => {
        request(app)
          .get("/experiments/search?q=CAGTCCGTTTGTTCT")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.type).toEqual("sequence");
            expect(res.body.data.bigsi.threshold).toEqual(1);
            expect(res.body.data.id).toBeTruthy();
            expect(res.body.data.users.length).toEqual(1);
            expect(res.body.data.users[0].firstname).toEqual("David");
            expect(res.body.data.status).toEqual(Search.constants().PENDING);
            done();
          });
      });
      it("should return carry on with normal search if invalid query", done => {
        request(app)
          .get("/experiments/search?q=insulin")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            const result = res.body.data.results[0];

            expect(result.metadata.patient.diabetic).toEqual("Insulin");
            expect(result.metadata.patient.age).toEqual(43);
            expect(result.metadata.sample.labId).toEqual("d19637ed-e5b4-4ca7-8418-8713646a3359");

            done();
          });
      });
    });
  });
  describe("# GET /experiments/search", () => {
    beforeEach(async done => {
      const sequenceSearchData = new Search(searches.searchOnly.sequence);
      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      const result = {
        type: "sequence",
        result: {},
        query: {
          seq: "CAGTCCGTTTGTTCT",
          threshold: 0.8
        }
      };
      result.result[`${isolateId1}`] = { percent_kmers_found: 100 };
      result.result[`${isolateId2}`] = { percent_kmers_found: 90 };
      sequenceSearchData.users.push(savedUser);
      sequenceSearchData.set("result", result);
      sequenceSearchData.status = Search.constants().COMPLETE;

      sequenceSearchData.expires = expires;
      const sequenceSearch = await sequenceSearchData.save();
      done();
    });
    describe("when no additional criteria provided", () => {
      it("should filter by experiments ids", done => {
        request(app)
          .get("/experiments/search?q=GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA&threshold=0.9")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");

            const data = res.body.data;

            expect(data.type).toEqual("sequence");
            expect(data.bigsi).toBeTruthy();
            expect(data.users).toBeTruthy();
            expect(data.result).toBeTruthy();

            const result = data.result;
            expect(result.type).toEqual("sequence");
            expect(result.experiments.length).toEqual(2);

            expect(result.experiments[0].id).toBeTruthy();
            expect(result.experiments[0].metadata).toBeTruthy();
            expect(result.experiments[0].results.bigsi).toBeTruthy();
            expect(result.experiments[0].results.bigsi.percent_kmers_found).toBeTruthy();

            expect(result.experiments[1].id).toBeTruthy();
            expect(result.experiments[1].metadata).toBeTruthy();
            expect(result.experiments[1].results.bigsi).toBeTruthy();
            expect(result.experiments[1].results.bigsi.percent_kmers_found).toBeTruthy();

            done();
          });
      });
    });
    describe("when additional criteria provided", () => {
      it("should filter by experiments ids and search criteria", done => {
        request(app)
          .get(
            "/experiments/search?q=GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA&threshold=0.9&metadata.patient.smoker=No"
          )
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");

            const data = res.body.data;
            expect(data.type).toEqual("sequence");
            expect(data.bigsi).toBeTruthy();
            expect(data.users).toBeTruthy();
            expect(data.result).toBeTruthy();

            const result = data.result;
            expect(result.type).toEqual("sequence");

            expect(result.experiments.length).toEqual(1);

            expect(result.experiments[0].id).toBeTruthy();
            expect(result.experiments[0].metadata).toBeTruthy();
            expect(result.experiments[0].metadata.patient.smoker).toEqual("No");
            expect(result.experiments[0].results.bigsi).toBeTruthy();
            expect(result.experiments[0].results.bigsi.percent_kmers_found).toEqual(90);

            done();
          });
      });
    });
    describe("when no results", () => {
      it("should return empty experiments", done => {
        request(app)
          .get(
            "/experiments/search?q=GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA&threshold=0.9&metadata.patient.smoker=Y"
          )
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");

            const data = res.body.data;
            expect(data.type).toEqual("sequence");
            expect(data.bigsi).toBeTruthy();
            expect(data.users).toBeTruthy();
            expect(data.result).toBeTruthy();

            const result = data.result;
            expect(result.experiments.length).toEqual(0);

            done();
          });
      });
    });
  });
});
