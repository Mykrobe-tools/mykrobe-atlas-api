import request from "supertest";
import httpStatus from "http-status";
import fs from "fs";
import hash from "object-hash";
import moment from "moment";

import Constants from "../../src/server/Constants";

import { config, createApp } from "../setup";

import SearchHelper from "../../src/server/helpers/SearchHelper";

import User from "../../src/server/models/user.model";
import Experiment from "../../src/server/models/experiment.model";
import Audit from "../../src/server/models/audit.model";
import Tree from "../../src/server/models/tree.model";
import Search from "../../src/server/models/search.model";

import { experimentEventEmitter, userEventEmitter } from "../../src/server/modules/events";

import MDR from "../fixtures/files/MDR_Results.json";
import predictor784 from "../fixtures/files/784.predictor.json";
import predictor787 from "../fixtures/files/787.predictor.json";
import predictor788 from "../fixtures/files/788.predictor.json";
import predictor789 from "../fixtures/files/789.predictor.json";
import NEAREST_NEIGHBOURS from "../fixtures/files/NEAREST_NEIGHBOURS_Results.json";

import results from "../fixtures/results";
import users from "../fixtures/users";
import experiments from "../fixtures/experiments";
import trees from "../fixtures/trees";
import searches from "../fixtures/searches";

const app = createApp();

const mongo = require("promised-mongo").compatible();

let token = null;
let id = null;

const findJob = (jobs, id, name) =>
  jobs.findOne({ "data.experiment_id": id, name }, (err, data) => data);

const findJobByDistanceType = (jobs, id, type, name) =>
  jobs.findOne({ "data.experiment_id": id, "data.distance_type": type, name }, (err, data) => data);

const findJobByName = (jobs, name) => jobs.findOne({ name }, (err, data) => data);

const findJobBySearchId = (jobs, id, name) =>
  jobs.findOne({ "data.search.id": id, name }, (err, data) => data);

beforeEach(async done => {
  const userData = new User(users.admin);
  const experimentData = new Experiment(experiments.tbUploadMetadata);

  const savedUser = await userData.save();
  request(app)
    .post("/auth/login")
    .send({ username: "admin@nhs.co.uk", password: "password" })
    .end(async (err, res) => {
      token = res.body.data.access_token;

      experimentData.owner = savedUser;
      const savedExperiment = await experimentData.save();

      id = savedExperiment.id;
      done();
    });
});

afterEach(async done => {
  jest.clearAllMocks();
  jest.restoreAllMocks();

  await User.remove({});
  await Experiment.remove({});
  await Search.remove({});
  await Audit.remove({});
  done();
});

describe("ExperimentController", () => {
  describe("# POST /experiments", () => {
    it("should create a new experiment", done => {
      request(app)
        .post("/experiments")
        .set("Authorization", `Bearer ${token}`)
        .send(experiments.tbUploadMetadata)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("metadata");

          const metadata = res.body.data.metadata;
          expect(metadata).toHaveProperty("patient");
          expect(metadata).toHaveProperty("sample");
          expect(metadata).toHaveProperty("genotyping");
          expect(metadata).toHaveProperty("phenotyping");
          expect(metadata).not.toHaveProperty("treatment");
          expect(metadata).not.toHaveProperty("outcome");

          done();
        });
    });

    it("should remove additional fields from the new experiment", done => {
      request(app)
        .post("/experiments")
        .set("Authorization", `Bearer ${token}`)
        .send(experiments.tbUploadMetadataWithAdditional)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("metadata");

          const metadata = res.body.data.metadata;
          expect(metadata).toHaveProperty("patient");
          expect(metadata).toHaveProperty("sample");
          expect(metadata).toHaveProperty("genotyping");
          expect(metadata).toHaveProperty("phenotyping");
          expect(metadata).not.toHaveProperty("treatment");
          expect(metadata).not.toHaveProperty("outcome");

          expect(res.body.data).not.toHaveProperty("field1");
          expect(res.body.data).not.toHaveProperty("field2");

          done();
        });
    });

    it("should set the owner to the current user", done => {
      request(app)
        .post("/experiments")
        .set("Authorization", `Bearer ${token}`)
        .send(experiments.tbUploadMetadata)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data.owner.firstname).toEqual("David");
          expect(res.body.data.owner.lastname).toEqual("Robin");

          done();
        });
    });
  });

  describe("# GET /experiments/:id", () => {
    it("should get experiment details", done => {
      request(app)
        .get(`/experiments/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("metadata");

          const metadata = res.body.data.metadata;
          expect(metadata).toHaveProperty("patient");
          expect(metadata).toHaveProperty("sample");
          expect(metadata).toHaveProperty("genotyping");
          expect(metadata).toHaveProperty("phenotyping");
          expect(metadata).not.toHaveProperty("treatment");
          expect(metadata).not.toHaveProperty("outcome");

          done();
        });
    });

    it("should populate the owner", done => {
      request(app)
        .get(`/experiments/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const owner = res.body.data.owner;
          expect(owner.firstname).toEqual("David");
          expect(owner.lastname).toEqual("Robin");
          expect(owner.email).toEqual("admin@nhs.co.uk");

          done();
        });
    });

    it("should report error with message - Not found, when experiment does not exists", done => {
      request(app)
        .get("/experiments/56c787ccc67fc16ccc1a5e92")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.NOT_FOUND)
        .end((err, res) => {
          expect(res.body.message).toEqual("Experiment not found with id 56c787ccc67fc16ccc1a5e92");
          done();
        });
    });

    it("should remove unwanted fields", done => {
      request(app)
        .get(`/experiments/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data._id).toBeUndefined();
          expect(res.body.data.__v).toBeUndefined();
          done();
        });
    });

    it("should add virtual fields", done => {
      request(app)
        .get(`/experiments/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.id).toEqual(id);
          done();
        });
    });

    describe("when results are populated", () => {
      describe("when using one type", () => {
        beforeEach(async done => {
          const experiment = await Experiment.get(id);
          const experimentResults = [];
          experimentResults.push(results.mdr);
          experiment.set("results", experimentResults);
          await experiment.save();
          done();
        });
        it("should return the results per type", done => {
          request(app)
            .get(`/experiments/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data).toHaveProperty("results");

              const results = res.body.data.results;
              expect(results).toHaveProperty("predictor");

              const predictor = results.predictor;

              expect(Object.keys(predictor.susceptibility).length).toEqual(9);
              expect(Object.keys(predictor.phylogenetics).length).toEqual(4);
              expect(predictor.analysed).toEqual("2018-07-12T11:23:20.964Z");
              expect(predictor.type).toEqual("predictor");
              expect(predictor.variantCalls).toBeUndefined();
              expect(predictor.sequenceCalls).toBeUndefined();
              done();
            });
        });
      });
      describe("when using multiple types", () => {
        beforeEach(async done => {
          const experiment = await Experiment.get(id);
          const experimentResults = [];
          experimentResults.push(results.mdr);
          experimentResults.push(results.distance.nearestNeighbour);
          experimentResults.push(results.distance.treeDistance);
          experiment.set("results", experimentResults);
          await experiment.save();
          done();
        });
        it("should return the results per type", done => {
          request(app)
            .get(`/experiments/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");

              expect(res.body.data).toHaveProperty("results");
              const results = res.body.data.results;

              expect(results).toHaveProperty("predictor");
              const predictor = results.predictor;

              expect(Object.keys(predictor.susceptibility).length).toEqual(9);
              expect(Object.keys(predictor.phylogenetics).length).toEqual(4);
              expect(predictor.analysed).toEqual("2018-07-12T11:23:20.964Z");
              expect(predictor.type).toEqual("predictor");

              expect(results).toHaveProperty("distance-nearest-neighbour");
              const nearestNeighbour = results["distance-nearest-neighbour"];

              expect(nearestNeighbour.susceptibility).toBeUndefined();
              expect(nearestNeighbour.phylogenetics).toBeUndefined();
              expect(nearestNeighbour.analysed).toEqual("2018-09-10T11:23:20.964Z");
              expect(nearestNeighbour.received).toEqual("2018-09-10T11:23:20.964Z");
              expect(nearestNeighbour.type).toEqual("distance");
              expect(nearestNeighbour.subType).toEqual("nearest-neighbour");

              expect(results).toHaveProperty("distance-tree-distance");
              const treeDistance = results["distance-tree-distance"];

              expect(treeDistance.susceptibility).toBeUndefined();
              expect(treeDistance.phylogenetics).toBeUndefined();
              expect(treeDistance.analysed).toEqual("2018-09-11T11:23:20.964Z");
              expect(treeDistance.received).toEqual("2018-09-11T11:23:20.964Z");
              expect(treeDistance.type).toEqual("distance");
              expect(treeDistance.subType).toEqual("tree-distance");

              done();
            });
        });
      });
      describe("when using duplicate types", () => {
        beforeEach(async done => {
          const experiment = await Experiment.get(id);
          const experimentResults = [];
          experimentResults.push(results.mdr);
          experimentResults.push(results.distance.nearestNeighbour);
          experimentResults.push(results.predictor);
          experiment.set("results", experimentResults);
          await experiment.save();
          done();
        });
        it("should return the results per latest type", done => {
          request(app)
            .get(`/experiments/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");

              expect(res.body.data).toHaveProperty("results");
              const results = res.body.data.results;

              expect(results).toHaveProperty("predictor");
              const predictor = results.predictor;

              expect(Object.keys(predictor.susceptibility).length).toEqual(4);
              expect(Object.keys(predictor.phylogenetics).length).toEqual(2);
              expect(predictor.analysed).toEqual("2018-09-12T11:23:20.964Z");
              expect(predictor.type).toEqual("predictor");

              expect(results).toHaveProperty("distance-nearest-neighbour");
              const nearestNeighbour = results["distance-nearest-neighbour"];

              expect(nearestNeighbour.susceptibility).toBeUndefined();
              expect(nearestNeighbour.phylogenetics).toBeUndefined();
              expect(nearestNeighbour.analysed).toEqual("2018-09-10T11:23:20.964Z");
              expect(nearestNeighbour.received).toEqual("2018-09-10T11:23:20.964Z");
              expect(nearestNeighbour.type).toEqual("distance");
              expect(nearestNeighbour.subType).toEqual("nearest-neighbour");
              expect(nearestNeighbour.experiments).toBeTruthy();
              done();
            });
        });
      });
      describe("when using nearest neighbours results", () => {
        beforeEach(async done => {
          const experimentWithMetadataResults = new Experiment(experiments.tbUploadMetadataResults);
          const savedExperimentWithMetadataResults = await experimentWithMetadataResults.save();
          const savedMetadata = savedExperimentWithMetadataResults.get("metadata");

          const experiment = await Experiment.get(id);
          const experimentResults = [];
          experimentResults.push({
            type: "distance",
            subType: "nearest-neighbour",
            experiments: [
              {
                id: savedMetadata.sample.isolateId,
                distance: 24
              }
            ]
          });
          experiment.set("results", experimentResults);
          await experiment.save();
          done();
        });
        it("should inflate the nearest neighbours results", done => {
          request(app)
            .get(`/experiments/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end((err, res) => {
              expect(res.body.status).toEqual("success");

              expect(res.body.data).toHaveProperty("results");
              const results = res.body.data.results;

              expect(results).toHaveProperty("distance-nearest-neighbour");
              const nearestNeighbour = results["distance-nearest-neighbour"];

              expect(nearestNeighbour.type).toEqual("distance");
              expect(nearestNeighbour.subType).toEqual("nearest-neighbour");

              expect(nearestNeighbour).toHaveProperty("experiments");
              expect(nearestNeighbour.experiments.length).toEqual(1);

              const first = nearestNeighbour.experiments.shift();

              expect(first.id).toBeTruthy();
              expect(first.distance).toEqual(24);
              expect(first.results).toBeTruthy();
              expect(first.metadata).toBeTruthy();

              expect(Object.keys(first.results).length).toEqual(1);
              expect(Object.keys(first.metadata).length).toEqual(6);

              done();
            });
        });
        it("should replace the experiments ids", done => {
          request(app)
            .get(`/experiments/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              expect(res.body.status).toEqual("success");

              expect(res.body.data).toHaveProperty("results");
              const results = res.body.data.results;

              expect(results).toHaveProperty("distance-nearest-neighbour");
              const nearestNeighbour = results["distance-nearest-neighbour"];

              expect(nearestNeighbour.type).toEqual("distance");
              expect(nearestNeighbour.subType).toEqual("nearest-neighbour");

              expect(nearestNeighbour).toHaveProperty("experiments");
              expect(nearestNeighbour.experiments.length).toEqual(1);

              const first = nearestNeighbour.experiments.shift();

              const targetExperiment = await Experiment.findByIsolateIds([
                "9c0c00f2-8cb1-4254-bf53-3271f35ce696"
              ]);

              expect(first.id).toEqual(targetExperiment[0].id);

              done();
            });
        });
      });
    });
  });

  describe("# PUT /experiments/:id", () => {
    const data = {
      metadata: {
        patient: {
          age: 45,
          bmi: 23.7
        }
      }
    };
    it("should update experiment details", done => {
      request(app)
        .put(`/experiments/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(data)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.data.metadata.patient.age).toEqual(45);
          expect(res.body.data.metadata.patient.bmi).toEqual(23.7);
          done();
        });
    });
    describe("when the owner is not the logged in user", () => {
      let thomasToken = null;
      beforeEach(async done => {
        request(app)
          .post("/auth/login")
          .send({ username: "thomas.carlos@nhs.net", password: "password" })
          .end(async (err, res) => {
            thomasToken = res.body.data.access_token;
            done();
          });
      });
      it("should return an permission error", done => {
        request(app)
          .put(`/experiments/${id}`)
          .set("Authorization", `Bearer ${thomasToken}`)
          .send(data)
          .expect(httpStatus.UNAUTHORIZED)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Only the owner can edit this experiment");
            done();
          });
      });
    });
    describe("#761 - saving metadata fails", () => {
      it("should update experiment details", done => {
        const body = {
          metadata: {
            sample: {
              labId: "123",
              isolateId: "123",
              collectionDate: "2019-05-06T23:00:00.000Z",
              prospectiveIsolate: "Yes",
              countryIsolate: "AF",
              cityIsolate: "a",
              dateArrived: "2019-05-06T23:00:00.000Z",
              anatomicalOrigin: "Respiratory",
              smear: "Not known"
            },
            patient: {
              patientId: "123456",
              siteId: "7890",
              genderAtBirth: "Male",
              countryOfBirth: "AL",
              age: 45,
              bmi: 13,
              injectingDrugUse: "No",
              homeless: "No",
              imprisoned: "Yes",
              smoker: "Yes",
              diabetic: "Not known",
              hivStatus: "Not known"
            }
          }
        };

        request(app)
          .put(`/experiments/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .send(body)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body).toHaveProperty("data");

            const data = res.body.data;
            expect(data).toHaveProperty("metadata");
            expect(data.metadata).toHaveProperty("sample");
            expect(data.metadata).toHaveProperty("patient");

            done();
          });
      });
      it("should update experiment details", done => {
        const body = {
          metadata: {
            sample: {
              labId: "123",
              isolateId: "234",
              collectionDate: "2019-05-06T23:00:00.000Z",
              prospectiveIsolate: "Yes",
              countryIsolate: "AF",
              dateArrived: "2019-05-06T23:00:00.000Z",
              anatomicalOrigin: "CSF",
              smear: "Not known"
            },
            patient: {
              patientId: "123",
              siteId: "234",
              genderAtBirth: "Male",
              countryOfBirth: "AL",
              age: 35,
              bmi: 25,
              injectingDrugUse: "Yes",
              homeless: "No",
              imprisoned: "No",
              smoker: "Yes",
              diabetic: "Diet alone",
              hivStatus: "Not known"
            }
          }
        };
        request(app)
          .put(`/experiments/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .send(body)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body).toHaveProperty("data");

            const data = res.body.data;
            expect(data).toHaveProperty("metadata");
            expect(data.metadata).toHaveProperty("sample");
            expect(data.metadata).toHaveProperty("patient");

            done();
          });
      });
    });
  });

  describe("# GET /experiments", () => {
    it("should get all experiments", done => {
      request(app)
        .get("/experiments")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toEqual(1);
          done();
        });
    });
  });

  describe("# DELETE /experiments/:id", () => {
    it("should delete experiment", done => {
      request(app)
        .delete(`/experiments/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("Experiment was successfully deleted.");
          done();
        });
    });

    it("should return an error if experiment not found", done => {
      request(app)
        .delete("/experiments/589dcdd38d71fee259dc4e00")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Experiment not found with id 589dcdd38d71fee259dc4e00");
          done();
        });
    });
    describe("when the owner is not the logged in user", () => {
      let thomasToken = null;
      beforeEach(async done => {
        request(app)
          .post("/auth/login")
          .send({ username: "thomas.carlos@nhs.net", password: "password" })
          .end(async (err, res) => {
            thomasToken = res.body.data.access_token;
            done();
          });
      });
      it("should return an permission error", done => {
        request(app)
          .delete(`/experiments/${id}`)
          .set("Authorization", `Bearer ${thomasToken}`)
          .expect(httpStatus.UNAUTHORIZED)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Only the owner can edit this experiment");
            done();
          });
      });
    });
  });
  describe("# PUT /experiments/:id/metadata", () => {
    it("should update experiment metadata", done => {
      const updatedMetadata = JSON.parse(JSON.stringify(experiments.tbUploadMetadata.metadata));
      updatedMetadata.patient.patientId = "7e89a3b3-8d7e-4120-87c5-741fb4ddeb8c";
      updatedMetadata.patient.bmi = 31.2;
      updatedMetadata.patient.smoker = "No";
      updatedMetadata.sample.labId = "7e89a3b3-8d7e-4120-87c5-741fb4ddeb8c";
      updatedMetadata.genotyping.wgsPlatform = "HiSeq";
      updatedMetadata.phenotyping.phenotypeInformationOtherDrugs = "Yes";

      request(app)
        .put(`/experiments/${id}/metadata`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatedMetadata)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          const metadataSaved = res.body.data.metadata;

          expect(metadataSaved.patient.patientId).toEqual("7e89a3b3-8d7e-4120-87c5-741fb4ddeb8c");
          expect(metadataSaved.patient.bmi).toEqual(31.2);
          expect(metadataSaved.patient.smoker).toEqual("No");
          expect(metadataSaved.sample.labId).toEqual("7e89a3b3-8d7e-4120-87c5-741fb4ddeb8c");
          expect(metadataSaved.genotyping.wgsPlatform).toEqual("HiSeq");
          expect(metadataSaved.phenotyping.phenotypeInformationOtherDrugs).toEqual("Yes");

          done();
        });
    });

    it("should return an error if experiment not found", done => {
      request(app)
        .put("/experiments/589dcdd38d71fee259dc4e00/metadata")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Experiment not found with id 589dcdd38d71fee259dc4e00");
          done();
        });
    });
  });
  describe("# PUT /experiments/:id/file", () => {
    it("should upload file using resumable", done => {
      request(app)
        .put(`/experiments/${id}/file`)
        .set("Authorization", `Bearer ${token}`)
        .field("resumableChunkNumber", 1)
        .field("resumableChunkSize", 1048576)
        .field("resumableCurrentChunkSize", 251726)
        .field("resumableTotalSize", 251726)
        .field("resumableType", "application/json")
        .field("resumableIdentifier", "251726-333-08json")
        .field("resumableFilename", "333-08.json")
        .field("resumableRelativePath", "333-08.json")
        .field("resumableTotalChunks", 1)
        .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
        .attach("file", "test/fixtures/files/333-08.json")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("File uploaded and reassembled");
          done();
        });
    });
    it("should create the reassembled file in the system", done => {
      request(app)
        .put(`/experiments/${id}/file`)
        .set("Authorization", `Bearer ${token}`)
        .field("resumableChunkNumber", 1)
        .field("resumableChunkSize", 1048576)
        .field("resumableCurrentChunkSize", 251726)
        .field("resumableTotalSize", 251726)
        .field("resumableType", "application/json")
        .field("resumableIdentifier", "251726-333-08json")
        .field("resumableFilename", "333-08.json")
        .field("resumableRelativePath", "333-08.json")
        .field("resumableTotalChunks", 1)
        .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
        .attach("file", "test/fixtures/files/333-08.json")
        .expect(httpStatus.OK)
        .end((err, res) => {
          const filePath = `${config.express.uploadDir}/experiments/${id}/file/333-08.json`;
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("File uploaded and reassembled");
          expect(fs.existsSync(filePath)).toEqual(true);
          done();
        });
    });
    it("should emit upload-complete event to all the subscribers", done => {
      const mockCallback = jest.fn();
      experimentEventEmitter.on("upload-complete", mockCallback);
      request(app)
        .put(`/experiments/${id}/file`)
        .set("Authorization", `Bearer ${token}`)
        .field("resumableChunkNumber", 1)
        .field("resumableChunkSize", 1048576)
        .field("resumableCurrentChunkSize", 251726)
        .field("resumableTotalSize", 251726)
        .field("resumableType", "application/json")
        .field("resumableIdentifier", "251726-333-08json")
        .field("resumableFilename", "333-08.json")
        .field("resumableRelativePath", "333-08.json")
        .field("resumableTotalChunks", 1)
        .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
        .attach("file", "test/fixtures/files/333-08.json")
        .expect(httpStatus.OK)
        .end((err, res) => {
          const filePath = `${config.express.uploadDir}/experiments/${id}/file/333-08.json`;
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("File uploaded and reassembled");
          expect(fs.existsSync(filePath)).toEqual(true);

          expect(mockCallback.mock.calls.length).toEqual(1);
          const calls = mockCallback.mock.calls;

          expect(mockCallback.mock.calls[0].length).toEqual(1);
          const object = mockCallback.mock.calls[0][0];

          expect(object).toHaveProperty("status");
          expect(object).toHaveProperty("experiment");

          const status = object.status;
          const experiment = object.experiment;

          expect(experiment.id).toEqual(id);
          expect(status.filename).toEqual("333-08.json");
          expect(status.complete).toEqual(true);

          done();
        });
    });
    it("should return an error if experiment not found", done => {
      request(app)
        .put("/experiments/589dcdd38d71fee259dc4e00/file")
        .set("Authorization", `Bearer ${token}`)
        .field("resumableChunkNumber", 1)
        .field("resumableChunkSize", 1048576)
        .field("resumableCurrentChunkSize", 251726)
        .field("resumableTotalSize", 251726)
        .field("resumableType", "application/json")
        .field("resumableIdentifier", "251726-333-08json")
        .field("resumableFilename", "333-08.json")
        .field("resumableRelativePath", "333-08.json")
        .field("resumableTotalChunks", 1)
        .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
        .attach("file", "test/fixtures/files/333-08.json")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Experiment not found with id 589dcdd38d71fee259dc4e00");
          done();
        });
    });
    it("should return an error if no file attached", done => {
      request(app)
        .put(`/experiments/${id}/file`)
        .set("Authorization", `Bearer ${token}`)
        .field("resumableChunkNumber", 1)
        .field("resumableChunkSize", 1048576)
        .field("resumableCurrentChunkSize", 251726)
        .field("resumableTotalSize", 251726)
        .field("resumableType", "application/json")
        .field("resumableIdentifier", "251726-333-08json")
        .field("resumableFilename", "333-08.json")
        .field("resumableRelativePath", "333-08.json")
        .field("resumableTotalChunks", 1)
        .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("No files found to upload");
          done();
        });
    });
    it("should return an error if checksum is not valid", done => {
      request(app)
        .put(`/experiments/${id}/file`)
        .set("Authorization", `Bearer ${token}`)
        .field("resumableChunkNumber", 1)
        .field("resumableChunkSize", 1048576)
        .field("resumableCurrentChunkSize", 251726)
        .field("resumableTotalSize", 251726)
        .field("resumableType", "application/json")
        .field("resumableIdentifier", "251726-333-08json")
        .field("resumableFilename", "333-08.json")
        .field("resumableRelativePath", "333-08.json")
        .field("resumableTotalChunks", 1)
        .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d55")
        .attach("file", "test/fixtures/files/333-08.json")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.data.complete).toEqual(false);
          expect(res.body.data.message).toEqual(
            "Uploaded file checksum doesn't match original checksum"
          );
          done();
        });
    });
    it("should return an error if chunk size is not correct", done => {
      request(app)
        .put(`/experiments/${id}/file`)
        .set("Authorization", `Bearer ${token}`)
        .field("resumableChunkNumber", 1)
        .field("resumableChunkSize", 1048576)
        .field("resumableCurrentChunkSize", 251726)
        .field("resumableTotalSize", 251700)
        .field("resumableType", "application/json")
        .field("resumableIdentifier", "251726-333-08json")
        .field("resumableFilename", "333-08.json")
        .field("resumableRelativePath", "333-08.json")
        .field("resumableTotalChunks", 1)
        .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
        .attach("file", "test/fixtures/files/333-08.json")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.data.complete).toEqual(false);
          expect(res.body.data.message).toEqual("Incorrect individual chunk size");
          done();
        });
    });
    describe("when provider and path are present", () => {
      it("should only allow valid providers", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "ftp",
            name: "fake.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Failed to upload sample file.");
            expect(res.body.data.errors.provider.message).toEqual(
              "should be equal to one of the allowed values"
            );
            done();
          });
      });
      it("should be a protected route", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", "Bearer INVALID_TOKEN")
          .send({
            provider: "dropbox",
            name: "fake.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Not Authorised");
            done();
          });
      });
      it("should download files from dropbox", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "dropbox",
            name: "fake.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from dropbox");
            done();
          });
      });
      it("should save file attribute", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "dropbox",
            name: "MDR.fastq.gz",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from dropbox");

            let updatedExperiment = await Experiment.get(id);
            while (!updatedExperiment.file) {
              updatedExperiment = await Experiment.get(id);
            }
            expect(updatedExperiment.file).toEqual("MDR.fastq.gz");
            done();
          });
      });
      it("should send the upload progress event to all subscribers", done => {
        const mockCallback = jest.fn();
        experimentEventEmitter.on("3rd-party-upload-progress", mockCallback);
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "dropbox",
            name: "MDR.fastq.gz",
            path: "https://dl.dropboxusercontent.com/1/view/1234"
          })
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from dropbox");

            let updatedExperiment = await Experiment.get(id);
            while (!updatedExperiment.file) {
              updatedExperiment = await Experiment.get(id);
            }

            expect(mockCallback.mock.calls.length).toBeTruthy();
            const args = mockCallback.mock.calls[0];

            expect(args.length).toEqual(1);
            const object = args[0];

            expect(object).toHaveProperty("status");
            expect(object).toHaveProperty("experiment");

            const status = object.status;
            const experiment = object.experiment;

            expect(experiment.id).toEqual(id);
            expect(status.provider).toEqual("dropbox");
            expect(status.totalSize).toEqual(23);
            expect(status.fileLocation).toEqual("/1/view/1234");

            done();
          });
      });
      it("should send the upload complete event to all subscribers", done => {
        const mockCallback = jest.fn();
        experimentEventEmitter.on("3rd-party-upload-complete", mockCallback);
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "dropbox",
            name: "MDR.fastq.gz",
            path: "https://dl.dropboxusercontent.com/1/view/1234"
          })
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from dropbox");

            let updatedExperiment = await Experiment.get(id);
            while (!updatedExperiment.file) {
              updatedExperiment = await Experiment.get(id);
            }
            /**
             * The event should be called at least one time, because of the parallel tests it may get called twice
             * This should be changed to expect(mockCallback.mock.calls.length).toBe(1); when running with runInBand
             */
            expect(mockCallback.mock.calls.length).toBeGreaterThanOrEqual(1);
            const args = mockCallback.mock.calls[0];

            expect(args.length).toEqual(1);
            const object = args[0];

            expect(object).toHaveProperty("status");
            expect(object).toHaveProperty("experiment");

            const status = object.status;
            const experiment = object.experiment;

            expect(experiment.id).toBeTruthy();
            expect(status.provider).toEqual("dropbox");
            expect(status.size).toBeTruthy();
            expect(status.totalSize).toBeTruthy();
            expect(status.fileLocation).toBeTruthy();
            done();
          });
      });
      it("should call the analysis api when download is done - dropbox", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "dropbox",
            name: "333-08.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from dropbox");
            try {
              let job = await findJob(jobs, id, "call analysis api");
              while (!job) {
                job = await findJob(jobs, id, "call analysis api");
              }
              expect(job.data.file).toEqual(
                `${config.express.uploadsLocation}/experiments/${id}/file/333-08.json`
              );
              expect(job.data.experiment_id).toEqual(id);
              expect(job.data.attempt).toEqual(0);
              done();
            } catch (e) {
              fail(e.message);
              done();
            }
          });
      });
      it("should save the dropbox file to the filesystem", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "dropbox",
            name: "fake.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end((err, res) => {
            const filePath = `${config.express.uploadDir}/experiments/${id}/file/fake.json`;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from dropbox");
            expect(fs.existsSync(filePath)).toEqual(true);
            done();
          });
      });
      it("should download files from box", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "box",
            name: "fake.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from box");
            done();
          });
      });
      it("should call the analysis api when download is done - box", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "box",
            name: "333-08.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from box");
            try {
              let job = await findJob(jobs, id, "call analysis api");
              while (!job) {
                job = await findJob(jobs, id, "call analysis api");
              }
              expect(job.data.file).toEqual(
                `${config.express.uploadsLocation}/experiments/${id}/file/333-08.json`
              );
              expect(job.data.experiment_id).toEqual(id);
              expect(job.data.attempt).toEqual(0);
              done();
            } catch (e) {
              fail(e.message);
              done();
            }
          });
      });
      it("should save the box file to the filesystem", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "box",
            name: "fake.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end((err, res) => {
            const filePath = `${config.express.uploadDir}/experiments/${id}/file/fake.json`;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from box");
            expect(fs.existsSync(filePath)).toEqual(true);
            done();
          });
      });
      it("should download files from google drive", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "googleDrive",
            name: "fake.json",
            path: "https://jsonplaceholder.typicode.com/posts/1",
            accessToken: "dummy-token"
          })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from googleDrive");
            done();
          });
      });
      it("should call the analysis api when download is done - googleDrive", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "googleDrive",
            name: "333-08.json",
            path: "https://jsonplaceholder.typicode.com/posts/1",
            accessToken: "dummy-token"
          })
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from googleDrive");
            try {
              let job = await findJob(jobs, id, "call analysis api");
              while (!job) {
                job = await findJob(jobs, id, "call analysis api");
              }
              expect(job.data.file).toEqual(
                `${config.express.uploadsLocation}/experiments/${id}/file/333-08.json`
              );
              expect(job.data.experiment_id).toEqual(id);
              expect(job.data.attempt).toEqual(0);
              done();
            } catch (e) {
              fail(e.message);
              done();
            }
          });
      });
      it("should make accessToken mandatory for googleDrive", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "googleDrive",
            name: "fake.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Failed to upload sample file.");
            expect(res.body.data.errors.accessToken.message).toEqual(
              "should have required property 'accessToken'"
            );
            done();
          });
      });
      it("should save the google drive file to the filesystem", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "googleDrive",
            name: "fake.json",
            path: "https://jsonplaceholder.typicode.com/posts/1",
            accessToken: "dummy-token"
          })
          .expect(httpStatus.OK)
          .end((err, res) => {
            const filePath = `${config.express.uploadDir}/experiments/${id}/file/fake.json`;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from googleDrive");
            expect(fs.existsSync(filePath)).toEqual(true);
            done();
          });
      });
      it("should download files from one drive", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "oneDrive",
            name: "fake.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from oneDrive");
            done();
          });
      });
      it("should call the analysis api when download is done - oneDrive", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "oneDrive",
            name: "333-08.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from oneDrive");
            try {
              let job = await findJob(jobs, id, "call analysis api");
              while (!job) {
                job = await findJob(jobs, id, "call analysis api");
              }
              expect(job.data.file).toEqual(
                `${config.express.uploadsLocation}/experiments/${id}/file/333-08.json`
              );
              expect(job.data.experiment_id).toEqual(id);
              expect(job.data.attempt).toEqual(0);
              done();
            } catch (e) {
              fail(e.message);
              done();
            }
          });
      });
      it("should save the one drive file to the filesystem", done => {
        request(app)
          .put(`/experiments/${id}/provider`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            provider: "oneDrive",
            name: "fake.json",
            path: "https://jsonplaceholder.typicode.com/posts/1"
          })
          .expect(httpStatus.OK)
          .end((err, res) => {
            const filePath = `${config.express.uploadDir}/experiments/${id}/file/fake.json`;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Download started from oneDrive");
            expect(fs.existsSync(filePath)).toEqual(true);
            done();
          });
      });
    });
    describe("when calling the analysis API", () => {
      it("should capture a payload including the sample id and file location", done => {
        request(app)
          .put(`/experiments/${id}/file`)
          .set("Authorization", `Bearer ${token}`)
          .field("resumableChunkNumber", 1)
          .field("resumableChunkSize", 1048576)
          .field("resumableCurrentChunkSize", 251726)
          .field("resumableTotalSize", 251726)
          .field("resumableType", "application/json")
          .field("resumableIdentifier", "251726-333-08json")
          .field("resumableFilename", "333-08.json")
          .field("resumableRelativePath", "333-08.json")
          .field("resumableTotalChunks", 1)
          .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
          .attach("file", "test/fixtures/files/333-08.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            try {
              let job = await findJob(jobs, id, "call analysis api");
              while (!job) {
                job = await findJob(jobs, id, "call analysis api");
              }
              expect(job.data.file).toEqual(
                `${config.express.uploadsLocation}/experiments/${id}/file/333-08.json`
              );
              expect(job.data.experiment_id).toEqual(id);
              expect(job.data.attempt).toEqual(0);
              done();
            } catch (e) {
              fail(e.message);
              done();
            }
          });
      });
      it("should call the analysis api with payload", done => {
        request(app)
          .put(`/experiments/${id}/file`)
          .set("Authorization", `Bearer ${token}`)
          .field("resumableChunkNumber", 1)
          .field("resumableChunkSize", 1048576)
          .field("resumableCurrentChunkSize", 251726)
          .field("resumableTotalSize", 251726)
          .field("resumableType", "application/json")
          .field("resumableIdentifier", "251726-333-08json")
          .field("resumableFilename", "333-08.json")
          .field("resumableRelativePath", "333-08.json")
          .field("resumableTotalChunks", 1)
          .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
          .attach("file", "test/fixtures/files/333-08.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            let job = await findJob(jobs, id, "call analysis api");
            while (!job) {
              job = await findJob(jobs, id, "call analysis api");
            }
            expect(job.name).toEqual("call analysis api");
            expect(job.data.file).toEqual(
              `${config.express.uploadsLocation}/experiments/${id}/file/333-08.json`
            );
            expect(job.data.experiment_id).toEqual(id);
            done();
          });
      });
      it("should record taskId to the audit collection", done => {
        request(app)
          .put(`/experiments/${id}/file`)
          .set("Authorization", `Bearer ${token}`)
          .field("resumableChunkNumber", 1)
          .field("resumableChunkSize", 1048576)
          .field("resumableCurrentChunkSize", 251726)
          .field("resumableTotalSize", 251726)
          .field("resumableType", "application/json")
          .field("resumableIdentifier", "251726-333-08json")
          .field("resumableFilename", "333-08.json")
          .field("resumableRelativePath", "333-08.json")
          .field("resumableTotalChunks", 1)
          .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
          .attach("file", "test/fixtures/files/333-08.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let audits = await Audit.find({
              experimentId: id,
              type: "Predictor"
            });
            while (audits.length === 0) {
              audits = await Audit.find({
                experimentId: id,
                type: "Predictor"
              });
            }
            const audit = audits[0];
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            expect(audit.experimentId).toEqual(id);
            expect(audit.fileLocation).toEqual(
              `${config.express.uploadsLocation}/experiments/${id}/file/333-08.json`
            );
            expect(audit.status).toEqual("Successful");
            expect(audit.attempt).toEqual(1);
            expect(audit.taskId).toEqual("1447d80f-ca79-40ac-bc5d-8a02933323c3");
            expect(audit.type).toEqual("Predictor");
            done();
          });
      });
      it("should emit the events to all subscribers", done => {
        const mockAnalysisCallback = jest.fn();
        const mockDistanceCallback = jest.fn();
        experimentEventEmitter.on("analysis-started", mockAnalysisCallback);
        experimentEventEmitter.on("distance-search-started", mockDistanceCallback);
        request(app)
          .put(`/experiments/${id}/file`)
          .set("Authorization", `Bearer ${token}`)
          .field("resumableChunkNumber", 1)
          .field("resumableChunkSize", 1048576)
          .field("resumableCurrentChunkSize", 251726)
          .field("resumableTotalSize", 251726)
          .field("resumableType", "application/json")
          .field("resumableIdentifier", "251726-333-08json")
          .field("resumableFilename", "333-08.json")
          .field("resumableRelativePath", "333-08.json")
          .field("resumableTotalChunks", 1)
          .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
          .attach("file", "test/fixtures/files/333-08.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let audits = await Audit.find({ experimentId: id });
            while (audits.length === 0) {
              audits = await Audit.find({ experimentId: id });
            }
            const audit = audits[0];
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            expect(audit.experimentId).toEqual(id);
            expect(audit.status).toEqual("Successful");
            expect(audit.attempt).toEqual(1);

            // Predictor
            expect(mockAnalysisCallback.mock.calls.length).toBeTruthy();
            const analysisCalls = mockAnalysisCallback.mock.calls[0];

            expect(analysisCalls.length).toEqual(1);
            const analysisArgs = analysisCalls[0];

            expect(analysisArgs).toHaveProperty("experiment");
            expect(analysisArgs).toHaveProperty("audit");

            const analysisExperiment = analysisArgs.experiment;
            const analysisAudit = analysisArgs.audit;

            expect(analysisExperiment.id).toEqual(id);
            expect(analysisAudit.taskId).toEqual("1447d80f-ca79-40ac-bc5d-8a02933323c3");

            done();
          });
      });
      it("should retry the analysis api call when failed", done => {
        request(app)
          .put(`/experiments/${id}/file`)
          .set("Authorization", `Bearer ${token}`)
          .field("resumableChunkNumber", 1)
          .field("resumableChunkSize", 1048576)
          .field("resumableCurrentChunkSize", 251726)
          .field("resumableTotalSize", 251726)
          .field("resumableType", "application/json")
          .field("resumableIdentifier", "251726-333-09json")
          .field("resumableFilename", "333-09.json")
          .field("resumableRelativePath", "333-09.json")
          .field("resumableTotalChunks", 1)
          .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
          .attach("file", "test/fixtures/files/333-09.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            let audits = await Audit.find({
              experimentId: id,
              type: "Predictor"
            });
            while (audits.length < 1) {
              audits = await Audit.find({
                experimentId: id,
                type: "Predictor"
              });
            }
            let foundJobs = await jobs.find({
              "data.experiment_id": id,
              name: "call analysis api"
            });
            while (foundJobs.length < 2) {
              foundJobs = await jobs.find({
                "data.experiment_id": id,
                name: "call analysis api"
              });
            }

            expect(foundJobs.length).toEqual(2);
            expect(foundJobs[0].data.file).toEqual(
              `${config.express.uploadsLocation}/experiments/${id}/file/333-09.json`
            );
            expect(foundJobs[0].data.experiment_id).toEqual(id);
            done();
          });
      });
      it("should record the audit when call failed", done => {
        request(app)
          .put(`/experiments/${id}/file`)
          .set("Authorization", `Bearer ${token}`)
          .field("resumableChunkNumber", 1)
          .field("resumableChunkSize", 1048576)
          .field("resumableCurrentChunkSize", 251726)
          .field("resumableTotalSize", 251726)
          .field("resumableType", "application/json")
          .field("resumableIdentifier", "251726-333-09json")
          .field("resumableFilename", "333-09.json")
          .field("resumableRelativePath", "333-09.json")
          .field("resumableTotalChunks", 1)
          .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
          .attach("file", "test/fixtures/files/333-09.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            let audits = await Audit.find({
              experimentId: id,
              type: "Predictor"
            });
            while (audits.length < 1) {
              audits = await Audit.find({
                experimentId: id,
                type: "Predictor"
              });
            }
            const audit = audits[0];
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            expect(audit.experimentId).toEqual(id);
            expect(audit.fileLocation).toEqual(
              `${config.express.uploadsLocation}/experiments/${id}/file/333-09.json`
            );
            expect(audit.status).toEqual("Failed");
            expect(audit.attempt).toEqual(1);
            expect(audit.type).toEqual("Predictor");
            done();
          });
      });
      it("should save the taskId in the audit collection", done => {
        request(app)
          .put(`/experiments/${id}/file`)
          .set("Authorization", `Bearer ${token}`)
          .field("resumableChunkNumber", 1)
          .field("resumableChunkSize", 1048576)
          .field("resumableCurrentChunkSize", 251726)
          .field("resumableTotalSize", 251726)
          .field("resumableType", "application/json")
          .field("resumableIdentifier", "251726-333-08json")
          .field("resumableFilename", "333-08.json")
          .field("resumableRelativePath", "333-08.json")
          .field("resumableTotalChunks", 1)
          .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
          .attach("file", "test/fixtures/files/333-08.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let audits = await Audit.find({
              experimentId: id,
              type: "Predictor"
            });
            while (audits.length === 0) {
              audits = await Audit.find({
                experimentId: id,
                type: "Predictor"
              });
            }
            const audit = audits[0];
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            expect(audit.experimentId).toEqual(id);
            expect(audit.fileLocation).toEqual(
              `${config.express.uploadsLocation}/experiments/${id}/file/333-08.json`
            );
            expect(audit.status).toEqual("Successful");
            expect(audit.attempt).toEqual(1);
            expect(audit.taskId).toEqual("1447d80f-ca79-40ac-bc5d-8a02933323c3");
            expect(audit.type).toEqual("Predictor");
            done();
          });
      });
    });
  });
  describe("# GET /experiments/:id/file", () => {
    it("should return an error if no file found", done => {
      request(app)
        .get(`/experiments/${id}/file`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.data).toEqual("No file found for this Experiment");
          done();
        });
    });
    it("should be a protected route", done => {
      request(app)
        .get(`/experiments/${id}/file`)
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
  });
  describe("# GET /experiments/:id/upload-status", () => {
    it("should return the resumable upload status", done => {
      request(app)
        .get(
          `/experiments/${id}/upload-status?resumableChunkNumber=1&resumableChunkSize=1048576&resumableTotalSize=251726&resumableIdentifier=251726-333-08json&resumableFilename=333-08.json&checksum=4f36e4cbfc9dfc37559e13bd3a309d50`
        )
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.NO_CONTENT)
        .end((err, res) => {
          expect(res.status).toEqual(204);
          done();
        });
    });
    it("should send no_content if upload in progress", done => {
      request(app)
        .put(`/experiments/${id}/file`)
        .set("Authorization", `Bearer ${token}`)
        .field("resumableChunkNumber", 1)
        .field("resumableChunkSize", 1048576)
        .field("resumableCurrentChunkSize", 251726)
        .field("resumableTotalSize", 251726)
        .field("resumableType", "application/json")
        .field("resumableIdentifier", "251726-333-08json")
        .field("resumableFilename", "333-08.json")
        .field("resumableRelativePath", "333-08.json")
        .field("resumableTotalChunks", 1)
        .field("checksum", "4f36e4cbfc9dfc37559e13bd3a309d50")
        .attach("file", "test/fixtures/files/333-08.json")
        .expect(httpStatus.OK)
        .end(() => {
          request(app)
            .get(
              `/experiments/${id}/upload-status?resumableChunkNumber=1&resumableChunkSize=1048576&resumableTotalSize=251726&resumableIdentifier=251726-333-08json&resumableFilename=333-08.json&checksum=4f36e4cbfc9dfc37559e13bd3a309d50`
            )
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.NO_CONTENT)
            .end((err, res) => {
              expect(res.status).toEqual(204);
              done();
            });
        });
    });
    it("should be a protected route", done => {
      request(app)
        .get(
          `/experiments/${id}/upload-status?resumableChunkNumber=1&resumableChunkSize=1048576&resumableTotalSize=251726&resumableIdentifier=251726-333-08json&resumableFilename=333-08.json&checksum=4f36e4cbfc9dfc37559e13bd3a309d50`
        )
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
  });
  describe("# POST /experiments/:id/results", () => {
    beforeEach(async done => {
      const auditData = {
        experimentId: id,
        taskId: "111-222-333",
        requestMethod: "post",
        requestUri: "/experiments/1234/results"
      };
      const audit = new Audit(auditData);
      await audit.save();

      done();
    });
    afterEach(async done => {
      const audit = await Audit.getByExperimentId(id);
      await audit.remove();

      done();
    });
    it("should be successful", done => {
      request(app)
        .post(`/experiments/${id}/results`)
        .send(MDR)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("results");
          expect(Object.keys(res.body.data.results).length).toEqual(1);

          const predictor = res.body.data.results["predictor"];

          expect(Object.keys(predictor.susceptibility).length).toEqual(9);
          expect(Object.keys(predictor.phylogenetics).length).toEqual(4);
          expect(predictor.variantCalls).toBeFalsy();
          expect(predictor.sequenceCalls).toBeFalsy();
          expect(predictor.received).toBeTruthy();

          done();
        });
    });
    it("should return r, mdr, xdr and tdr attributes", done => {
      request(app)
        .post(`/experiments/${id}/results`)
        .send(MDR)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("results");
          expect(Object.keys(res.body.data.results).length).toEqual(1);

          const predictor = res.body.data.results["predictor"];

          expect(predictor).toHaveProperty("r", true);
          expect(predictor).toHaveProperty("mdr");
          expect(predictor).toHaveProperty("xdr");
          expect(predictor).toHaveProperty("tdr");

          expect(predictor.r).toBe(true);
          expect(predictor.mdr).toBe(true);
          expect(predictor.xdr).toBe(false);
          expect(predictor.tdr).toBe(false);

          done();
        });
    });
    it("should save results against the experiment", done => {
      request(app)
        .post(`/experiments/${id}/results`)
        .send(MDR)
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          const experimentWithResults = await Experiment.get(id);
          const results = experimentWithResults.get("results");

          expect(results.length).toEqual(1);
          done();
        });
    });
    it("should create nearest neighbours results", done => {
      request(app)
        .post(`/experiments/${id}/results`)
        .send(NEAREST_NEIGHBOURS)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("results");
          expect(Object.keys(res.body.data.results).length).toEqual(1);

          const nearestNeighbour = res.body.data.results["distance-nearest-neighbour"];

          expect(nearestNeighbour.type).toEqual("distance");
          expect(nearestNeighbour.subType).toEqual("nearest-neighbour");
          expect(nearestNeighbour.experiments.length).toEqual(9);
          nearestNeighbour.experiments.forEach(experiment => {
            expect(experiment).toHaveProperty("id");
            expect(experiment).toHaveProperty("distance");
          });

          done();
        });
    });
    it("should not handle invalid result type", done => {
      request(app)
        .post(`/experiments/${id}/results`)
        .send({ type: "invalid" })
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Invalid result type.");
          done();
        });
    });
    it("should save r, mdr, xdr and tdr against the experiment", done => {
      request(app)
        .post(`/experiments/${id}/results`)
        .send(MDR)
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          const experimentWithResults = await Experiment.get(id);
          const results = experimentWithResults.get("results");

          expect(results.length).toEqual(1);

          const result = results[0].toJSON();

          expect(result).toHaveProperty("r");
          expect(result).toHaveProperty("mdr");
          expect(result).toHaveProperty("xdr");
          expect(result).toHaveProperty("tdr");

          expect(result.r).toBe(true);
          expect(result.mdr).toBe(true);
          expect(result.xdr).toBe(false);
          expect(result.tdr).toBe(false);

          done();
        });
    });
    it("should emit analysis-complete event to all subscribers", done => {
      const mockCallback = jest.fn();
      experimentEventEmitter.on("analysis-complete", mockCallback);
      request(app)
        .post(`/experiments/${id}/results`)
        .send(MDR)
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          const experimentWithResults = await Experiment.get(id);
          const results = experimentWithResults.get("results");

          expect(results.length).toEqual(1);

          const calls = mockCallback.mock.calls;
          expect(calls.length).toEqual(1);

          const args = calls[0];
          expect(args.length).toEqual(1);

          const object = args[0];
          expect(object).toHaveProperty("audit");
          expect(object).toHaveProperty("experiment");
          expect(object).toHaveProperty("type");

          const audit = object.audit;
          const experiment = object.experiment;
          const type = object.type;

          expect(experiment.id).toEqual(id);
          expect(audit.experimentId).toEqual(id.toString());
          expect(audit.taskId).toEqual("111-222-333");
          expect(type).toEqual("predictor");

          expect(experiment).toHaveProperty("results");
          expect(experiment.results).toHaveProperty("predictor");

          const predictor = experiment.results.predictor;

          const experimentId = Object.keys(MDR.result).pop();
          const result = MDR.result[experimentId];

          expect(predictor.externalId).toEqual(experimentId);
          expect(predictor.files).toEqual(result.files);
          expect(predictor.genotypeModel).toEqual(result.genotype_model);
          expect(predictor.kmer).toEqual(result.kmer);
          Object.keys(result.phylogenetics).forEach(key => {
            expect(predictor.phylogenetics).toHaveProperty(key);
            Object.keys(result.phylogenetics[key]).forEach(phyloKey => {
              expect(predictor.phylogenetics[key]).toHaveProperty(phyloKey);
            });
          });

          done();
        });
    });
    describe("when validating result format #784", () => {
      it("should be successful", done => {
        const mockCallback = jest.fn();
        experimentEventEmitter.on("analysis-complete", mockCallback);
        request(app)
          .post(`/experiments/${id}/results`)
          .send(predictor784)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            if (err) {
              done(err);
            }

            expect(res.body.status).toEqual("success");
            expect(res.body.data).toHaveProperty("results");
            expect(Object.keys(res.body.data.results).length).toEqual(1);

            const predictor = res.body.data.results["predictor"];

            expect(Object.keys(predictor.susceptibility).length).toEqual(11);
            expect(Object.keys(predictor.phylogenetics).length).toEqual(4);
            expect(predictor.variantCalls).toBeFalsy();
            expect(predictor.sequenceCalls).toBeFalsy();
            expect(predictor.received).toBeTruthy();

            done();
          });
      });
      it("should save results against the experiment", done => {
        request(app)
          .post(`/experiments/${id}/results`)
          .send(predictor784)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const experimentWithResults = await Experiment.get(id);
            const results = experimentWithResults.get("results");

            expect(results.length).toEqual(1);
            done();
          });
      });
    });
    describe("when saving a result of a sparesely populated experiment #787", () => {
      it("should return successfully", async done => {
        const data = {
          metadata: {
            sample: {
              isolateId: "SAMEA4744311",
              countryIsolate: "BR",
              cityIsolate: "",
              longitudeIsolate: -53.2,
              latitudeIsolate: -10.3333333
            }
          }
        };
        const experiment = new Experiment(data);
        const savedExperiment = await experiment.save();
        const experimentId = savedExperiment._id;

        request(app)
          .post(`/experiments/${experimentId}/results`)
          .send(predictor787)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body.data).toHaveProperty("results");

            const results = res.body.data.results;
            expect(results).toHaveProperty("predictor");
            done();
          });
      });
    });
    describe("when saving a predictor result into an experiment with empty country #788", () => {
      it("should return successfully", async done => {
        const data = {
          metadata: {
            sample: {
              isolateId: "SAMEA1018978",
              countryIsolate: "",
              cityIsolate: ""
            }
          }
        };
        const experiment = new Experiment(data);
        const savedExperiment = await experiment.save();
        const experimentId = savedExperiment._id;

        request(app)
          .post(`/experiments/${experimentId}/results`)
          .send(predictor788)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body.data).toHaveProperty("results");

            const results = res.body.data.results;
            expect(results).toHaveProperty("predictor");
            done();
          });
      });
    });
    describe("when saving a predictor result into an experiment with empty country #789", () => {
      it("should return successfully", async done => {
        const data = {
          metadata: {
            sample: {
              isolateId: "SAMEA1015968",
              countryIsolate: "RU",
              cityIsolate: "",
              longitudeIsolate: 97.7453061,
              latitudeIsolate: 64.6863136
            }
          }
        };
        const experiment = new Experiment(data);
        const savedExperiment = await experiment.save();
        const experimentId = savedExperiment._id;

        request(app)
          .post(`/experiments/${experimentId}/results`)
          .send(predictor789)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body.data).toHaveProperty("results");

            const results = res.body.data.results;
            expect(results).toHaveProperty("predictor");

            const predictor = results.predictor;
            expect(predictor).toHaveProperty("susceptibility");

            const susceptibility = predictor.susceptibility;
            expect(susceptibility).toHaveProperty("Ethambutol");
            expect(susceptibility.Ethambutol).toHaveProperty("prediction", "R");
            expect(susceptibility.Pyrazinamide).toHaveProperty("prediction", "R");
            done();
          });
      });
    });
  });
  describe("# POST /experiments/reindex", () => {
    it("should reindex all experiments to ES", done => {
      request(app)
        .post("/experiments/reindex")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("All 1 experiment(s) have been indexed.");
          done();
        });
    });
    it("should be a protected route", done => {
      request(app)
        .post("/experiments/reindex")
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
  });
  describe("# GET /experiments/:id/results", () => {
    describe("when the results are empty", () => {
      it("should return empty results object", done => {
        request(app)
          .get(`/experiments/${id}/results`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual([]);
            done();
          });
      });
    });
    describe("when using one type", () => {
      beforeEach(async done => {
        const experiment = await Experiment.get(id);
        const experimentResults = [];
        experimentResults.push(results.mdr);
        experiment.set("results", experimentResults);
        await experiment.save();
        done();
      });
      it("should return the transformed results array", done => {
        request(app)
          .get(`/experiments/${id}/results`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.length).toEqual(1);

            const result = res.body.data.shift();

            expect(Object.keys(result.susceptibility).length).toEqual(9);
            expect(Object.keys(result.phylogenetics).length).toEqual(4);
            expect(result.analysed).toEqual("2018-07-12T11:23:20.964Z");
            expect(result.type).toEqual("predictor");

            done();
          });
      });
      it("should be a protected route", done => {
        request(app)
          .get(`/experiments/${id}/results`)
          .set("Authorization", "Bearer INVALID_TOKEN")
          .expect(httpStatus.UNAUTHORIZED)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Not Authorised");
            done();
          });
      });
    });
    describe("when using multiple types", () => {
      beforeEach(async done => {
        const experiment = await Experiment.get(id);
        const experimentResults = [];
        experimentResults.push(results.mdr);
        experimentResults.push(results.distance.nearestNeighbour);
        experimentResults.push(results.distance.treeDistance);

        experiment.set("results", experimentResults);
        await experiment.save();
        done();
      });
      it("should return all results", done => {
        request(app)
          .get(`/experiments/${id}/results`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.length).toEqual(3);

            const results = {};
            res.body.data.forEach(result => {
              const type = [result.type, result.subType].filter(Boolean).join("-");
              results[type] = result;
            });

            const predictor = results["predictor"];

            expect(Object.keys(predictor.susceptibility).length).toEqual(9);
            expect(Object.keys(predictor.phylogenetics).length).toEqual(4);
            expect(predictor.analysed).toEqual("2018-07-12T11:23:20.964Z");
            expect(predictor.type).toEqual("predictor");

            const nearestNeighbour = results["distance-nearest-neighbour"];

            expect(nearestNeighbour.received).toEqual("2018-09-10T11:23:20.964Z");
            expect(nearestNeighbour.analysed).toEqual("2018-09-10T11:23:20.964Z");
            expect(nearestNeighbour.type).toEqual("distance");
            expect(nearestNeighbour.subType).toEqual("nearest-neighbour");
            expect(Object.keys(nearestNeighbour.experiments).length).toEqual(9);

            const treeDistance = results["distance-tree-distance"];

            expect(treeDistance.received).toEqual("2018-09-11T11:23:20.964Z");
            expect(treeDistance.analysed).toEqual("2018-09-11T11:23:20.964Z");
            expect(treeDistance.type).toEqual("distance");
            expect(treeDistance.subType).toEqual("tree-distance");
            expect(Object.keys(treeDistance.experiments).length).toEqual(9);

            done();
          });
      });
    });
    describe("when using duplicate types", () => {
      beforeEach(async done => {
        const experiment = await Experiment.get(id);
        const experimentResults = [];
        experimentResults.push(results.mdr);
        experimentResults.push(results.distance);
        experimentResults.push(results.predictor);
        experiment.set("results", experimentResults);
        await experiment.save();
        done();
      });
      it("should return all results", done => {
        request(app)
          .get(`/experiments/${id}/results`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");

            expect(res.body.data.length).toEqual(3);
            done();
          });
      });
    });
  });

  describe("# GET /experiments/tree", () => {
    describe("when there is no tree in the db", () => {
      it("should return the tree object and create one in mongo", done => {
        beforeEach(async () => {
          await Tree.remove({});
        });
        request(app)
          .get("/experiments/tree")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.tree).toEqual("00004012993414038108");
            const fromCache = await Tree.get();
            expect(fromCache).toBeTruthy();
            done();
          });
      });
    });
    describe("when the tree has expired", () => {
      beforeEach(async () => {
        const treeData = new Tree(trees.expiredResult);
        await treeData.save();
      });
      afterEach(async () => {
        await Tree.remove({});
      });
      it("should return the new tree object and update the cache", done => {
        request(app)
          .get("/experiments/tree")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.tree).toEqual("00004012993414038108");

            const fromCache = await Tree.get();

            expect(fromCache.tree).toEqual("00004012993414038108");
            expect(fromCache.isExpired()).toEqual(false);

            done();
          });
      });
    });
    describe("when the tree is not expired", () => {
      beforeEach(async () => {
        const treeData = new Tree(trees.activeResult);
        const expiryDate = new moment().add(1, "month");
        treeData.expires = expiryDate.toISOString();

        const tree = await treeData.save();
      });
      afterEach(async () => {
        await Tree.remove({});
      });
      it("should the return tree object from cache", done => {
        request(app)
          .get("/experiments/tree")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data.expires).toBeTruthy();
            expect(res.body.data.tree).toEqual(
              "((6792-05:0.00000092410001012564,3160-04:0.00000081736801752172)"
            );
            expect(res.body.data.version).toEqual("1.0");
            expect(res.body.data.type).toEqual("newick");

            done();
          });
      });
    });
    it("should be a protected route", done => {
      request(app)
        .get("/experiments/tree")
        .set("Authorization", "Bearer INVALID_TOKEN")
        .expect(httpStatus.UNAUTHORIZED)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual("Not Authorised");
          done();
        });
    });
  });

  describe("#refresh isolateId", () => {
    it("should schedule a daily job", async done => {
      request(app)
        .get("/experiments")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          const jobs = mongo(config.db.uri, []).agendaJobs;
          const job = await findJobByName(jobs, "refresh isolateId");
          expect(job.name).toEqual("refresh isolateId");
          expect(job.nextRunAt).toBeTruthy();
          expect(job.repeatInterval).toEqual("0 0 * * *");
          done();
        });
    });
  });

  describe("# GET /experiments/search", () => {
    describe("when calling a bigsi search", () => {
      describe("when no search found in the cache", () => {
        it("should create a new search with status pending", done => {
          request(app)
            .get("/experiments/search?q=rpoB_S450L")
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.status).toEqual(Constants.SEARCH_PENDING);
              expect(res.body.data.type).toEqual("protein-variant");

              const data = res.body.data;
              expect(data).toHaveProperty("type", "protein-variant");
              expect(data).toHaveProperty("bigsi");

              const bigsi = data.bigsi;
              expect(bigsi).toHaveProperty("type", "protein-variant");
              expect(bigsi).toHaveProperty("query");

              const query = bigsi.query;
              expect(query).toHaveProperty("gene", "rpoB");
              expect(query).toHaveProperty("ref", "S");
              expect(query).toHaveProperty("pos", 450);
              expect(query).toHaveProperty("alt", "L");
              done();
            });
        });
        it("should add the user to the list of users", done => {
          request(app)
            .get("/experiments/search?q=rpoB_S450L")
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data).toHaveProperty("users");

              const users = res.body.data.users;
              expect(users.length).toEqual(1);

              const user = users.shift();
              expect(user.firstname).toEqual("David");
              expect(user.lastname).toEqual("Robin");
              expect(user.email).toEqual("admin@nhs.co.uk");
              done();
            });
        });
        it("should trigger the bigsi search", done => {
          request(app)
            .get("/experiments/search?q=rpoB_S450L")
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              const jobs = mongo(config.db.uri, []).agendaJobs;
              expect(res.body.status).toEqual("success");
              try {
                let job = await findJobBySearchId(jobs, res.body.data.id, "call search api");
                while (!job) {
                  job = await findJobBySearchId(jobs, res.body.data.id, "call search api");
                }
                expect(job.data).toHaveProperty("search");
                expect(job.data.search.type).toEqual("protein-variant");
                expect(job.data.search).toHaveProperty("bigsi");
                expect(job.data.search.bigsi).toHaveProperty("type", "protein-variant");
                expect(job.data.search.bigsi).toHaveProperty("query");

                const query = job.data.search.bigsi.query;
                expect(query.gene).toEqual("rpoB");
                expect(query.ref).toEqual("S");
                expect(query.pos).toEqual(450);
                expect(query.alt).toEqual("L");
                done();
              } catch (e) {
                fail(e.message);
                done();
              }
            });
        });
        it("should create a valid hash", done => {
          request(app)
            .get("/experiments/search?q=rpoB_S450L")
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.hash).toEqual(
                SearchHelper.generateHash({
                  type: "protein-variant",
                  bigsi: {
                    type: "protein-variant",
                    query: {
                      gene: "rpoB",
                      ref: "S",
                      pos: 450,
                      alt: "L"
                    }
                  }
                })
              );
              done();
            });
        });
        describe("when no gene is provided", () => {
          it("should trigger protein variant search", done => {
            request(app)
              .get("/experiments/search?q=C32T")
              .set("Authorization", `Bearer ${token}`)
              .expect(httpStatus.OK)
              .end(async (err, res) => {
                const jobs = mongo(config.db.uri, []).agendaJobs;
                expect(res.body.status).toEqual("success");
                try {
                  let job = await findJobBySearchId(jobs, res.body.data.id, "call search api");
                  while (!job) {
                    job = await findJobBySearchId(jobs, res.body.data.id, "call search api");
                  }
                  expect(job.data.search.bigsi.type).toEqual("protein-variant");
                  expect(job.data.search.bigsi.gene).toBeUndefined();
                  expect(job.data.search.bigsi.ref).toEqual("C");
                  expect(job.data.search.bigsi.pos).toEqual(32);
                  expect(job.data.search.bigsi.alt).toEqual("T");
                  done();
                } catch (e) {
                  fail(e.message);
                  done();
                }
              });
          });
          it("should create a valid hash", done => {
            request(app)
              .get("/experiments/search?q=C32T")
              .set("Authorization", `Bearer ${token}`)
              .expect(httpStatus.OK)
              .end(async (err, res) => {
                expect(res.body.status).toEqual("success");
                expect(res.body.data.bigsi).toEqual({
                  type: "protein-variant",
                  ref: "C",
                  pos: 32,
                  alt: "T"
                });
                done();
              });
          });
        });
      });
      describe("when a pending search found in the cache", () => {
        let searchId = null;
        beforeEach(async done => {
          try {
            const searchData = new Search(searches.searchOnly.proteinVariant);
            const savedSearch = await searchData.save();

            searchId = savedSearch.id;
            const auditData = new Audit({
              status: "Successful",
              searchId,
              taskId: "123-456-789",
              type: savedSearch.type,
              attempt: 1,
              requestMethod: "post"
            });

            await auditData.save();
            done();
          } catch (e) {
            done(e);
          }
        });
        it("should add the user to the list of users to be notified", done => {
          request(app)
            .get("/experiments/search?q=rpoB_S450L")
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.id).toEqual(searchId);
              expect(res.body.data.users.length).toEqual(1);
              expect(res.body.data.users[0].firstname).toEqual("David");
              done();
            });
        });
        it("should notify the user", done => {
          const mockCallback = jest.fn();
          userEventEmitter.on("protein-variant-search-started", mockCallback);
          request(app)
            .get("/experiments/search?q=rpoB_S450L")
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.id).toEqual(searchId);
              expect(mockCallback.mock.calls.length).toEqual(1);
              const calls = mockCallback.mock.calls;

              expect(mockCallback.mock.calls[0].length).toEqual(1);
              const object = mockCallback.mock.calls[0][0];

              expect(object.search.id).toEqual(searchId);
              expect(object.user.firstname).toEqual("David");

              done();
            });
        });
      });
      describe("when a results are available and not expired", () => {
        let searchId = null;
        beforeEach(async done => {
          const searchData = new Search(searches.full.proteinVariant);
          const expires = new Date();
          expires.setDate(expires.getDate() + 1);
          searchData.expires = expires;
          const savedSearch = await searchData.save();
          searchId = savedSearch.id;
          const auditData = new Audit({
            status: "Successful",
            searchId,
            taskId: "123-456-789",
            type: savedSearch.type,
            attempt: 1,
            requestMethod: "post"
          });
          await auditData.save();
          done();
        });
        it("should not add the user to the list of users", done => {
          request(app)
            .get("/experiments/search?q=rpoB_S450L")
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.id).toEqual(searchId);
              expect(res.body.data.users.length).toEqual(0);
              done();
            });
        });
        it("should not notify the user", done => {
          const mockCallback = jest.fn();
          userEventEmitter.on("protein-variant-search-started", mockCallback);
          request(app)
            .get("/experiments/search?q=rpoB_S450L")
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.id).toEqual(searchId);
              expect(mockCallback.mock.calls.length).toEqual(0);
              done();
            });
        });
      });
      describe("when a results are expired", () => {
        let searchId = null;
        beforeEach(async done => {
          const search = new Search(searches.full.proteinVariant);

          // expire the search
          const expires = moment();
          expires.subtract(2, "days");
          search.expires = expires.toDate();

          const savedSearch = await search.save();

          searchId = savedSearch.id;
          const auditData = new Audit({
            status: "Successful",
            searchId,
            taskId: "123-456-789",
            type: savedSearch.type,
            attempt: 1,
            requestMethod: "post"
          });
          await auditData.save();
          done();
        });
        it("should add the user to the list of users to notify", done => {
          request(app)
            .get("/experiments/search?q=rpoB_S450L")
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              expect(res.body.status).toEqual("success");
              expect(res.body.data.id).toEqual(searchId);
              expect(res.body.data.users.length).toEqual(1);
              expect(res.body.data.users[0].firstname).toEqual("David");

              done();
            });
        });
        it("should trigger the bigsi search", done => {
          request(app)
            .get("/experiments/search?q=rpoB_S450L")
            .set("Authorization", `Bearer ${token}`)
            .expect(httpStatus.OK)
            .end(async (err, res) => {
              const jobs = mongo(config.db.uri, []).agendaJobs;
              expect(res.body.status).toEqual("success");
              try {
                let job = await findJobBySearchId(jobs, res.body.data.id, "call search api");
                while (!job) {
                  job = await findJobBySearchId(jobs, res.body.data.id, "call search api");
                }
                const search = job.data.search;

                expect(search).toHaveProperty("type", "protein-variant");
                expect(search).toHaveProperty("bigsi");
                const bigsi = search.bigsi;
                expect(bigsi).toHaveProperty("type", "protein-variant");
                expect(bigsi).toHaveProperty("query");
                const query = bigsi.query;
                expect(query.gene).toEqual("rpoB");
                expect(query.ref).toEqual("S");
                expect(query.pos).toEqual(450);
                expect(query.alt).toEqual("L");

                done();
              } catch (e) {
                fail(e.message);
                done();
              }
            });
        });
      });
    });
  });

  describe("# POST /experiments/:id/refresh", () => {
    describe("when provided data is correct", () => {
      it("should return a successful response", done => {
        request(app)
          .post(`/experiments/${id}/refresh`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Update of existing results triggered");
            done();
          });
      });
      it("should trigger the distance api with type nearest-neighbour", done => {
        request(app)
          .post(`/experiments/${id}/refresh`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Update of existing results triggered");
            try {
              let job = await findJobByDistanceType(
                jobs,
                id,
                "nearest-neighbour",
                "call distance api"
              );
              while (!job) {
                job = await findJobByDistanceType(
                  jobs,
                  id,
                  "nearest-neighbour",
                  "call distance api"
                );
              }
              expect(job.data.experiment_id).toEqual(id);
              expect(job.data.distance_type).toEqual("nearest-neighbour");
              done();
            } catch (e) {
              fail(e.message);
              done();
            }
          });
      });
      it("should trigger the distance api with type tree-distance", done => {
        request(app)
          .post(`/experiments/${id}/refresh`)
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("Update of existing results triggered");
            try {
              let job = await findJobByDistanceType(jobs, id, "tree-distance", "call distance api");
              while (!job) {
                job = await findJobByDistanceType(jobs, id, "tree-distance", "call distance api");
              }
              expect(job.data.experiment_id).toEqual(id);
              expect(job.data.distance_type).toEqual("tree-distance");
              done();
            } catch (e) {
              fail(e.message);
              done();
            }
          });
      });
    });
    describe("when provided data is incorrect", () => {
      it("should be a protected route", done => {
        request(app)
          .post(`/experiments/${id}/refresh`)
          .set("Authorization", "Bearer INVALID")
          .expect(httpStatus.UNAUTHORIZED)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual("Not Authorised");
            done();
          });
      });
      it("should throw an error if experiment doesnt exist", done => {
        request(app)
          .post("/experiments/56c787ccc67fc16ccc1a5e92/refresh")
          .set("Authorization", `Bearer ${token}`)
          .expect(httpStatus.OK)
          .end((err, res) => {
            expect(res.body.status).toEqual("error");
            expect(res.body.message).toEqual(
              "Experiment not found with id 56c787ccc67fc16ccc1a5e92"
            );
            done();
          });
      });
    });
  });
});
