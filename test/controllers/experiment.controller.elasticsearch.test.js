import moment from "moment";
import request from "supertest";
import httpStatus from "http-status";

import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch";
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

const app = createApp();

let token = null;

const experimentWithMetadata = new Experiment(experiments.tbUploadMetadataPredictorResults);
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
  await ElasticsearchHelper.createIndex(config, experimentSearchSchema, "experiment");

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
  done();
}, 60000);

afterAll(async done => {
  //await ElasticsearchHelper.deleteIndexIfExists(config);
  //await ElasticsearchHelper.createIndex(config, experimentSearchSchema, "experiment");
  await Experiment.remove({});
  done();
});

describe("ExperimentController > Elasticsearch", () => {
  describe("# GET /experiments/choices", () => {
    // POST.c40633601de3b1ca1d7aa77ad5fbd6284a20781f.mock
    it.only("should return choices and counts for enums", done => {
      request(app)
        .get("/experiments/choices")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          /*
          expect(res.body.status).toEqual("success");
          const data = res.body.data;
          console.log("data --> "+JSON.stringify(data));

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
          */
          console.log(JSON.stringify(res.body));

          done();
        });
    });
    // POST.c40633601de3b1ca1d7aa77ad5fbd6284a20781f.mock
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
    // POST.c40633601de3b1ca1d7aa77ad5fbd6284a20781f.mock
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
    // POST.c40633601de3b1ca1d7aa77ad5fbd6284a20781f.mock
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
    // POST.c40633601de3b1ca1d7aa77ad5fbd6284a20781f.mock
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
    // POST.c40633601de3b1ca1d7aa77ad5fbd6284a20781f.mock
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
    // POST.287e3ec4e46a5b7f9803be03f252c29284f56572.mock
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
    // POST.30f98efc12e95978db30d97497fc490d27058009.mock
    // new POST.8c0d09b2058ddc4583b0cb05a9a3a614a062cc1e.mock
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
    // POST.2913e48e54ced7c197a2fdd88702dd1a9ae1983f.mock
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
    // POST.4d725fbbca4c98531075480ee54680326418211f.mock
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
    // POST.114cdd30775d2652ad5e5ad9d9e42942812e23c4.mock
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
    // POST.3b76a1019f239ceed5f8ea6f9034d80de307efd0.mock
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
    it("should remove bigsi search filters", done => {
      request(app)
        .get(
          "/experiments/choices?q=CAGTCCGTTTGTTCT&metadata.patient.patientId=9bd049c5-7407-4129-a973-17291ccdd2cc"
        )
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
    it.skip("should match the relevance to the score from elasticsearch", done => {
      request(app)
        .get("/experiments/search?q=insulin")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.metadata.maxRelevance).toEqual(3.8100972);
          res.body.data.results.forEach(result => {
            expect(result).toHaveProperty("relevance", 3.8100972);
          });
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
          expect(res.body.data).toHaveProperty("total", 2);
          expect(res.body.data).toHaveProperty("results");
          expect(res.body.data.results.length).toEqual(2);
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
          expect(res.body.data).toHaveProperty("total", 2);
          expect(res.body.data).toHaveProperty("results");
          expect(res.body.data.results.length).toEqual(2);
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
            expect(res.body.data).toHaveProperty("type", "sequence");

            expect(res.body.data).toHaveProperty("bigsi");
            const bigsi = res.body.data.bigsi;
            expect(bigsi).toHaveProperty("type", "sequence");
            expect(bigsi).toHaveProperty("query");
            const query = bigsi.query;
            expect(query.threshold).toEqual(40);
            expect(res.body.data.id).toBeTruthy();
            done();
          });
      });
      it("should return a search object for sequence search - no threshold", done => {
        request(app)
          .get("/experiments/search?q=CAGTCCGTTTGTTCT&threshold=80")
          .set("Authorization", `Bearer ${token}`)
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
      it("should return a search_id for protein variant search", done => {
        request(app)
          .get("/experiments/search?q=rpoB_S450L")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toHaveProperty("type", "protein-variant");

            expect(res.body.data).toHaveProperty("bigsi");
            const bigsi = res.body.data.bigsi;
            expect(bigsi).toHaveProperty("type", "protein-variant");
            expect(bigsi).toHaveProperty("query");
            const query = bigsi.query;
            expect(query.gene).toEqual("rpoB");
            expect(query.ref).toEqual("S");
            expect(query.pos).toEqual(450);
            expect(query.alt).toEqual("L");

            expect(res.body.data.id).toBeTruthy();
            done();
          });
      });
      it("should save search in mongo", done => {
        request(app)
          .get("/experiments/search?q=CAGTCCGTTTGTTCT&threshold=80")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const searchId = res.body.data.id;
            const search = await Search.get(searchId);
            expect(search).toHaveProperty("type", "sequence");
            const bigsi = search.get("bigsi");
            const query = bigsi.query;
            expect(query.threshold).toEqual(80);
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

            expect(res.body.data).toHaveProperty("type", "sequence");

            const user = res.body.data.users.shift();
            expect(user.firstname).toEqual("David");
            expect(user.lastname).toEqual("Robin");
            expect(user.email).toEqual("admin@nhs.co.uk");
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
            expect(res.body.data.status).toEqual(Constants.SEARCH_PENDING);
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
      result.results.push({
        "metadata.sample.isolateId": isolateId1,
        percent_kmers_found: 100
      });
      result.results.push({
        "metadata.sample.isolateId": isolateId2,
        percent_kmers_found: 90
      });

      sequenceSearchData.users.push(savedUser);
      sequenceSearchData.set("result", result);
      sequenceSearchData.status = Constants.SEARCH_COMPLETE;

      const sequenceSearch = await sequenceSearchData.save();
      done();
    });
    describe("when no additional criteria provided", () => {
      it("should filter by experiments ids", done => {
        request(app)
          .get("/experiments/search?q=GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA&threshold=90")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");

            const data = res.body.data;

            expect(data.type).toEqual("sequence");
            expect(data.bigsi).toBeTruthy();
            expect(data.users).toBeTruthy();
            expect(data.results).toBeTruthy();
            expect(data.type).toEqual("sequence");

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

            done();
          });
      });
    });
    describe("when additional criteria provided", () => {
      it("should filter by experiments ids and search criteria", done => {
        request(app)
          .get(
            "/experiments/search?q=GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA&threshold=90&metadata.patient.smoker=No"
          )
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");

            const data = res.body.data;

            expect(data.type).toEqual("sequence");
            expect(data.bigsi).toBeTruthy();
            expect(data.users).toBeTruthy();
            expect(data.results).toBeTruthy();
            expect(data.type).toEqual("sequence");

            const results = data.results;
            expect(results.length).toEqual(1);

            const result = results.shift();

            expect(result.id).toBeTruthy();
            expect(result.metadata).toBeTruthy();
            expect(result.metadata.patient.smoker).toEqual("No");
            expect(result.percent_kmers_found).toEqual(90);

            done();
          });
      });
    });
    describe("when no results", () => {
      it("should return empty experiments", done => {
        request(app)
          .get(
            "/experiments/search?q=GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA&threshold=90&metadata.patient.smoker=Y"
          )
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");

            const data = res.body.data;

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
});
