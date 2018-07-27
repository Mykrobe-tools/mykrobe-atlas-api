import request from "supertest";
import httpStatus from "http-status";
import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch";
import { createApp } from "../setup";
import User from "../../models/user.model";
import Experiment from "../../models/experiment.model";
import Organisation from "../../models/organisation.model";
import config from "../../../config/env/";
import { experiment as experimentSchema } from "mykrobe-atlas-jsonschema";

jest.mock("keycloak-admin-client");

const app = createApp();

const users = require("../fixtures/users");

let token = null;

const experiments = require("../fixtures/experiments");
const metadata = require("../fixtures/metadata");

const experimentWithMetadata = new Experiment(experiments.tbUploadMetadata);
const experimentWithChineseMetadata = new Experiment(
  experiments.tbUploadMetadataChinese
);

beforeEach(async done => {
  const userData = new User(users.admin);
  await userData.save();
  request(app)
    .post("/auth/login")
    .send({ email: "admin@nhs.co.uk", password: "password" })
    .end((err, res) => {
      token = res.body.data.access_token;
      done();
    });
});

afterEach(async done => {
  await User.remove({});
  done();
});

beforeAll(async done => {
  await ElasticsearchHelper.deleteIndexIfExists(config);
  await ElasticsearchHelper.createIndex(config, experimentSchema, "experiment");

  await experimentWithMetadata.save();
  await experimentWithChineseMetadata.save();

  // index to elasticsearch
  const experiments = await Experiment.list();
  await ElasticsearchHelper.indexDocuments(config, experiments, "experiment");

  let data = await ElasticsearchHelper.search(config, {}, "experiment");
  while (data.hits.total < 2) {
    data = await ElasticsearchHelper.search(config, {}, "experiment");
  }

  done();
});

afterAll(async done => {
  await ElasticsearchHelper.deleteIndexIfExists(config);
  await ElasticsearchHelper.createIndex(config, experimentSchema, "experiment");
  await Experiment.remove({});
  done();
});

describe("## Experiment APIs", () => {
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

          expect(data["metadata.sample.dateArrived"].min).toEqual(
            "2017-11-05T00:00:00.000Z"
          );
          expect(data["metadata.sample.dateArrived"].max).toEqual(
            "2018-09-01T00:00:00.000Z"
          );
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

          expect(
            data["metadata.phenotyping.gatifloxacin.method"].title
          ).toEqual("Method");
          expect(
            data["metadata.phenotyping.phenotypeInformationFirstLineDrugs"]
              .title
          ).toEqual("Phenotype Information First Line Drugs");
          expect(
            data["metadata.treatment.outsideStandardPhaseAmikacin.stop"].title
          ).toEqual("Date stopped");
          expect(data["metadata.patient.diabetic"].title).toEqual("Diabetic");
          expect(
            data["metadata.phenotyping.pretothionamide.susceptibility"].title
          ).toEqual("Susceptible");
          expect(data["metadata.outcome.whoOutcomeCategory"].title).toEqual(
            "WHO Outcome Category"
          );
          expect(data["metadata.genotyping.hainAm"].title).toEqual("HAIN AM");

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
        .get(
          "/experiments/choices?metadata.patient.patientId=9bd049c5-7407-4129-a973-17291ccdd2cc"
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
          expect(data["metadata.sample.dateArrived"].min).toEqual(
            "2017-11-05T00:00:00.000Z"
          );
          expect(data["metadata.sample.dateArrived"].max).toEqual(
            "2017-11-05T00:00:00.000Z"
          );

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
          expect(data["metadata.sample.dateArrived"].min).toEqual(
            "2017-11-05T00:00:00.000Z"
          );
          expect(data["metadata.sample.dateArrived"].max).toEqual(
            "2018-09-01T00:00:00.000Z"
          );

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
          expect(data["metadata.sample.dateArrived"].min).toEqual(
            "2017-11-05T00:00:00.000Z"
          );
          expect(data["metadata.sample.dateArrived"].max).toEqual(
            "2017-11-05T00:00:00.000Z"
          );

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
          expect(data["metadata.patient.diabetic"].choices[0].key).toEqual(
            "Insulin"
          );
          expect(data["metadata.genotyping.genexpert"].choices[0].key).toEqual(
            "Not tested"
          );
          expect(data["metadata.patient.age"].max).toEqual(43);
          expect(data["metadata.patient.bmi"].min).toEqual(25.3);
          expect(data["metadata.sample.dateArrived"].min).toEqual(
            "2018-09-01T00:00:00.000Z"
          );

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
          expect(data["metadata.patient.diabetic"].choices[0].key).toEqual(
            "Insulin"
          );
          expect(data["metadata.genotyping.genexpert"].choices[0].key).toEqual(
            "Not tested"
          );
          expect(data["metadata.patient.age"].max).toEqual(43);
          expect(data["metadata.patient.bmi"].min).toEqual(25.3);
          expect(data["metadata.sample.dateArrived"].min).toEqual(
            "2018-09-01T00:00:00.000Z"
          );

          done();
        });
    });
    it("should apply partial match free text queries", done => {
      request(app)
        .get("/experiments/choices?q=emale")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");

          const data = res.body.data;
          expect(data["metadata.patient.age"].min).toEqual(32);
          expect(data["metadata.patient.age"].max).toEqual(32);
          expect(data["metadata.patient.bmi"].min).toEqual(33.1);
          expect(data["metadata.patient.bmi"].max).toEqual(33.1);
          expect(data["metadata.sample.dateArrived"].min).toEqual(
            "2017-11-05T00:00:00.000Z"
          );
          expect(data["metadata.sample.dateArrived"].max).toEqual(
            "2017-11-05T00:00:00.000Z"
          );

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
        .get(
          "/experiments/search?metadata.patient.smoker=Yes&metadata.patient.imprisoned=No"
        )
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
          expect(result.metadata.sample.labId).toEqual(
            "d19637ed-e5b4-4ca7-8418-8713646a3359"
          );

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
          expect(result.metadata.sample.labId).toEqual(
            "d19637ed-e5b4-4ca7-8418-8713646a3359"
          );

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
        .get(
          "/experiments/search?metadata.patient.smoker=Yes&metadata.patient.imprisoned=No"
        )
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
    it("should control the page value", done => {
      request(app)
        .get(
          "/experiments/search?metadata.smoker=No&metadata.imprisoned=Yes&per=10&page=0"
        )
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            expect.stringContaining(
              "numHits must be > 0; please use TotalHitCountCollector if you just need the total hit count"
            )
          );
          done();
        });
    });
  });
});
