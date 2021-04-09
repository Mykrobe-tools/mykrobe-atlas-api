import { MongoClient } from "mongodb";
import mongoose from "mongoose";

import Audit from "./audit.model";

import Audits from "./__fixtures__/Audits";

const args = {
  audit: null,
  client: null
};

beforeAll(async done => {
  // db: Use in-memory db for tests
  args.client = await MongoClient.connect(global.__MONGO_URI__, {});
  await args.client.db(global.__MONGO_DB_NAME__);
  await mongoose.connect(global.__MONGO_URI__, {});

  done();
});

beforeEach(async done => {
  const auditData = new Audit(Audits.valid.audit);
  args.audit = await auditData.save();

  done();
});

afterEach(async done => {
  await Audit.deleteMany({});
  done();
});

describe("Audit", () => {
  describe("#save", () => {
    describe("when valid", () => {
      it("should save properties", async done => {
        expect(args.audit.taskId).toEqual("7897d8dc-ad6a-4a46-be4f-7ad9eb2ad08c");
        expect(args.audit.experimentId).toEqual("eac95021-a637-443e-b4af-b6a59bda0f21");
        expect(args.audit.searchId).toEqual("e16d10ed-f887-45ee-a851-8cf42454ed06");
        expect(args.audit.requestMethod).toEqual("GET");
        expect(args.audit.requestUri).toEqual("https://cli.mykrobe.com/analysis");
        expect(args.audit.fileLocation).toEqual("/data/atlas/MDR.fastq.gz");
        expect(args.audit.status).toEqual("complete");
        expect(args.audit.type).toEqual("analysis");
        expect(args.audit.attempt).toEqual(1);

        done();
      });
    });
  });
  describe("#getByExperimentId", () => {
    describe("when valid", () => {
      describe("when the experiment id exists", () => {
        it("should return the Audit", async done => {
          const match = await Audit.getByExperimentId("eac95021-a637-443e-b4af-b6a59bda0f21");
          expect(match).toBeTruthy();
          done();
        });
      });
    });
    describe("when not valid", () => {
      describe("when the experiment does not exist", () => {
        it("should return the Audit", async done => {
          const match = await Audit.getByExperimentId("missing");
          expect(match).toBeFalsy();
          done();
        });
      });
    });
  });
  describe("#getByTaskId", () => {
    describe("when valid", () => {
      describe("when the task id exists", () => {
        it("should return an Audit object", async done => {
          const match = await Audit.getByTaskId("7897d8dc-ad6a-4a46-be4f-7ad9eb2ad08c");
          expect(match).toBeTruthy();
          done();
        });
      });
    });
    describe("when not valid", () => {
      describe("when the task does not exist", () => {
        it("should not return an Audit object", async done => {
          const match = await Audit.getByTaskId("missing");
          expect(match).toBeFalsy();
          done();
        });
      });
    });
  });
  describe("#getBySearchId", () => {
    describe("when valid", () => {
      describe("when the search id exists", () => {
        it("should return the Audit object", async done => {
          const match = await Audit.getBySearchId("e16d10ed-f887-45ee-a851-8cf42454ed06");
          expect(match).toBeTruthy();
          done();
        });
      });
    });
    describe("when not valid", () => {
      describe("when the search does not exist", () => {
        it("should not return an Audit object", async done => {
          const match = await Audit.getBySearchId("missing");
          expect(match).toBeFalsy();
          done();
        });
      });
    });
  });
  describe("#toJSON", () => {
    describe("when valid", () => {
      it("should return core audit details", async done => {
        const foundAudit = await Audit.getByTaskId("7897d8dc-ad6a-4a46-be4f-7ad9eb2ad08c");
        const json = foundAudit.toJSON();
        expect(json.experimentId).toEqual("eac95021-a637-443e-b4af-b6a59bda0f21");
        done();
      });
    });
  });
});
