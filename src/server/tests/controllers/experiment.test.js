import request from "supertest";
import httpStatus from "http-status";
import fs from "fs";
import nock from "nock";
import { config, createApp } from "../setup";
import User from "../../models/user.model";
import Experiment from "../../models/experiment.model";
import Audit from "../../models/audit.model";
import MDR from "../../tests/fixtures/files/MDR_Results.json";
import { mockEsCalls } from "../mocks";

mockEsCalls();

jest.mock("keycloak-admin-client");

const app = createApp();

const mongo = require("promised-mongo").compatible();
const users = require("../fixtures/users");
const experiments = require("../fixtures/experiments");

let token = null;
let id = null;

const findJob = (jobs, id) =>
  jobs.findOne({ "data.sample_id": id }, (err, data) => data);

beforeEach(async done => {
  const userData = new User(users.admin);
  const experimentData = new Experiment(experiments.tbUploadMetadata);

  const savedUser = await userData.save();
  request(app)
    .post("/auth/login")
    .send({ email: "admin@nhs.co.uk", password: "password" })
    .end(async (err, res) => {
      token = res.body.data.access_token;

      experimentData.owner = savedUser;
      const savedExperiment = await experimentData.save();

      id = savedExperiment.id;

      done();
    });
});

afterEach(async done => {
  await User.remove({});
  await Experiment.remove({});
  done();
});

describe("## Experiment APIs", () => {
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
          expect(res.body.message).toEqual(
            "Experiment not found with id 56c787ccc67fc16ccc1a5e92"
          );
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
  });

  describe("# PUT /experiments/:id", () => {
    it("should update experiment details", done => {
      const data = {
        metadata: {
          patient: {
            age: 45,
            bmi: 23.7
          }
        }
      };
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
  });

  describe("# GET /experiments", () => {
    it.only("should get all experiments", done => {
      request(app)
        .get("/experiments")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .end((err, res) => {
          console.log(JSON.stringify(res.body.data, null, 2));
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
          expect(res.body.message).toEqual(
            "Experiment not found with id 589dcdd38d71fee259dc4e00"
          );
          done();
        });
    });
  });
  describe("# PUT /experiments/:id/metadata", () => {
    it("should update experiment metadata", done => {
      const updatedMetadata = JSON.parse(
        JSON.stringify(experiments.tbUploadMetadata.metadata)
      );
      updatedMetadata.patient.patientId =
        "7e89a3b3-8d7e-4120-87c5-741fb4ddeb8c";
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

          expect(metadataSaved.patient.patientId).toEqual(
            "7e89a3b3-8d7e-4120-87c5-741fb4ddeb8c"
          );
          expect(metadataSaved.patient.bmi).toEqual(31.2);
          expect(metadataSaved.patient.smoker).toEqual("No");
          expect(metadataSaved.sample.labId).toEqual(
            "7e89a3b3-8d7e-4120-87c5-741fb4ddeb8c"
          );
          expect(metadataSaved.genotyping.wgsPlatform).toEqual("HiSeq");
          expect(
            metadataSaved.phenotyping.phenotypeInformationOtherDrugs
          ).toEqual("Yes");

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
          expect(res.body.message).toEqual(
            "Experiment not found with id 589dcdd38d71fee259dc4e00"
          );
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
        .attach("file", "src/server/tests/fixtures/files/333-08.json")
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
        .attach("file", "src/server/tests/fixtures/files/333-08.json")
        .expect(httpStatus.OK)
        .end((err, res) => {
          const filePath = `${config.express.uploadDir}/experiments/${
            id
          }/file/333-08.json`;
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toEqual("File uploaded and reassembled");
          expect(fs.existsSync(filePath)).toEqual(true);
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
        .attach("file", "src/server/tests/fixtures/files/333-08.json")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.message).toEqual(
            "Experiment not found with id 589dcdd38d71fee259dc4e00"
          );
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
        .attach("file", "src/server/tests/fixtures/files/333-08.json")
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
        .attach("file", "src/server/tests/fixtures/files/333-08.json")
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("error");
          expect(res.body.data.complete).toEqual(false);
          expect(res.body.data.message).toEqual(
            "Incorrect individual chunk size"
          );
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
            expect(res.body.message).toEqual(
              '"provider" must be one of [dropbox, box, googleDrive, oneDrive]'
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
            const filePath = `${config.express.uploadDir}/experiments/${
              id
            }/file/fake.json`;
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
            const filePath = `${config.express.uploadDir}/experiments/${
              id
            }/file/fake.json`;
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
            expect(res.body.message).toEqual('"accessToken" is required');
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
            const filePath = `${config.express.uploadDir}/experiments/${
              id
            }/file/fake.json`;
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
            const filePath = `${config.express.uploadDir}/experiments/${
              id
            }/file/fake.json`;
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
          .attach("file", "src/server/tests/fixtures/files/333-08.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            try {
              let job = await findJob(jobs, id);
              while (!job) {
                job = await findJob(jobs, id);
              }
              expect(job.data.file).toEqual(
                `${config.express.uploadsLocation}/experiments/${
                  id
                }/file/333-08.json`
              );
              expect(job.data.sample_id).toEqual(id);
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
          .attach("file", "src/server/tests/fixtures/files/333-08.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            let job = await findJob(jobs, id);
            while (!job) {
              job = await findJob(jobs, id);
            }
            expect(job.name).toEqual("call analysis api");
            expect(job.data.file).toEqual(
              `${config.express.uploadsLocation}/experiments/${
                id
              }/file/333-08.json`
            );
            expect(job.data.sample_id).toEqual(id);
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
          .attach("file", "src/server/tests/fixtures/files/333-08.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let audits = await Audit.find({ sampleId: id });
            while (audits.length === 0) {
              audits = await Audit.find({ sampleId: id });
            }
            const audit = audits[0];
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            expect(audit.sampleId).toEqual(id);
            expect(audit.fileLocation).toEqual(
              `${config.express.uploadsLocation}/experiments/${
                id
              }/file/333-08.json`
            );
            expect(audit.status).toEqual("Successful");
            expect(audit.attempt).toEqual(1);
            expect(audit.taskId).toEqual(
              "1447d80f-ca79-40ac-bc5d-8a02933323c3"
            );
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
          .attach("file", "src/server/tests/fixtures/files/333-09.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            let audits = await Audit.find({ sampleId: id });
            while (audits.length < 1) {
              audits = await Audit.find({ sampleId: id });
            }
            let foundJobs = await jobs.find({ "data.sample_id": id });
            while (foundJobs.length < 2) {
              foundJobs = await jobs.find({ "data.sample_id": id });
            }
            expect(foundJobs.length).toEqual(2);
            expect(foundJobs[0].data.file).toEqual(
              `${config.express.uploadsLocation}/experiments/${
                id
              }/file/333-09.json`
            );
            expect(foundJobs[0].data.sample_id).toEqual(id);
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
          .attach("file", "src/server/tests/fixtures/files/333-09.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            const jobs = mongo(config.db.uri, []).agendaJobs;
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            let audits = await Audit.find({ sampleId: id });
            while (audits.length < 1) {
              audits = await Audit.find({ sampleId: id });
            }
            const audit = audits[0];
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            expect(audit.sampleId).toEqual(id);
            expect(audit.fileLocation).toEqual(
              `${config.express.uploadsLocation}/experiments/${
                id
              }/file/333-09.json`
            );
            expect(audit.status).toEqual("Failed");
            expect(audit.attempt).toEqual(1);
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
          .attach("file", "src/server/tests/fixtures/files/333-08.json")
          .expect(httpStatus.OK)
          .end(async (err, res) => {
            let audits = await Audit.find({ sampleId: id });
            while (audits.length === 0) {
              audits = await Audit.find({ sampleId: id });
            }
            const audit = audits[0];
            expect(res.body.status).toEqual("success");
            expect(res.body.data).toEqual("File uploaded and reassembled");
            expect(audit.sampleId).toEqual(id);
            expect(audit.fileLocation).toEqual(
              `${config.express.uploadsLocation}/experiments/${
                id
              }/file/333-08.json`
            );
            expect(audit.status).toEqual("Successful");
            expect(audit.attempt).toEqual(1);
            expect(audit.taskId).toEqual(
              "1447d80f-ca79-40ac-bc5d-8a02933323c3"
            );
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
          `/experiments/${
            id
          }/upload-status?resumableChunkNumber=1&resumableChunkSize=1048576&resumableTotalSize=251726&resumableIdentifier=251726-333-08json&resumableFilename=333-08.json&checksum=4f36e4cbfc9dfc37559e13bd3a309d50`
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
        .attach("file", "src/server/tests/fixtures/files/333-08.json")
        .expect(httpStatus.OK)
        .end(() => {
          request(app)
            .get(
              `/experiments/${
                id
              }/upload-status?resumableChunkNumber=1&resumableChunkSize=1048576&resumableTotalSize=251726&resumableIdentifier=251726-333-08json&resumableFilename=333-08.json&checksum=4f36e4cbfc9dfc37559e13bd3a309d50`
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
          `/experiments/${
            id
          }/upload-status?resumableChunkNumber=1&resumableChunkSize=1048576&resumableTotalSize=251726&resumableIdentifier=251726-333-08json&resumableFilename=333-08.json&checksum=4f36e4cbfc9dfc37559e13bd3a309d50`
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
  describe("# POST /experiments/:id/result", () => {
    it("should be successful", done => {
      request(app)
        .post(`/experiments/${id}/result`)
        .send(MDR)
        .expect(httpStatus.OK)
        .end((err, res) => {
          expect(res.body.status).toEqual("success");
          expect(res.body.data).toHaveProperty("results");
          expect(res.body.data.results.length).toEqual(1);
          done();
        });
    });
    it("should save results against the experiment", done => {
      request(app)
        .post(`/experiments/${id}/result`)
        .send(MDR)
        .expect(httpStatus.OK)
        .end(async (err, res) => {
          const experimentWithResults = await Experiment.get(id);
          const results = experimentWithResults.get("results");

          expect(results.length).toEqual(1);
          done();
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
          expect(res.body.data).toEqual("All Experiments have been indexed.");
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
});
