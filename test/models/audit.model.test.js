import Audit from "../../src/server/models/audit.model";

import setup from "../setup";

import audits from "../fixtures/audits";

describe("Audit", () => {
  let audit = null;
  beforeEach(async done => {
    const auditData = new Audit(audits.valid);
    audit = await auditData.save();

    done();
  });
  afterEach(async done => {
    await Audit.deleteMany({});
    done();
  });

  describe("#save", () => {
    describe("with valid data", () => {
      it("should save properties", async done => {
        expect(audit.taskId).toEqual("7897d8dc-ad6a-4a46-be4f-7ad9eb2ad08c");
        expect(audit.experimentId).toEqual("eac95021-a637-443e-b4af-b6a59bda0f21");
        expect(audit.searchId).toEqual("e16d10ed-f887-45ee-a851-8cf42454ed06");
        expect(audit.requestMethod).toEqual("GET");
        expect(audit.requestUri).toEqual("https://cli.mykrobe.com/analysis");
        expect(audit.fileLocation).toEqual("/data/atlas/MDR.fastq.gz");
        expect(audit.status).toEqual("complete");
        expect(audit.type).toEqual("analysis");
        expect(audit.attempt).toEqual(1);

        done();
      });
    });
  });
  describe("#getByExperimentId", () => {
    describe("when the experiment id exists", () => {
      it("should return the Audit", async done => {
        const match = await Audit.getByExperimentId("eac95021-a637-443e-b4af-b6a59bda0f21");
        expect(match).toBeTruthy();
        done();
      });
    });
    describe("when the experiment does not exist", () => {
      it("should return the Audit", async done => {
        const match = await Audit.getByExperimentId("missing");
        expect(match).toBeFalsy();
        done();
      });
    });
  });
  describe("#getByTaskId", () => {
    describe("when the task id exists", () => {
      it("should return the Audit", async done => {
        const match = await Audit.getByTaskId("7897d8dc-ad6a-4a46-be4f-7ad9eb2ad08c");
        expect(match).toBeTruthy();
        done();
      });
    });
    describe("when the task does not exist", () => {
      it("should return the Audit", async done => {
        const match = await Audit.getByTaskId("missing");
        expect(match).toBeFalsy();
        done();
      });
    });
  });
  describe("#getBySearchId", () => {
    describe("when the search id exists", () => {
      it("should return the Audit", async done => {
        const match = await Audit.getBySearchId("e16d10ed-f887-45ee-a851-8cf42454ed06");
        expect(match).toBeTruthy();
        done();
      });
    });
    describe("when the search does not exist", () => {
      it("should return the Audit", async done => {
        const match = await Audit.getBySearchId("missing");
        expect(match).toBeFalsy();
        done();
      });
    });
    describe("#toJSON", () => {
      it("return core audit details", async done => {
        const foundAudit = await Audit.getByTaskId("7897d8dc-ad6a-4a46-be4f-7ad9eb2ad08c");
        const json = foundAudit.toJSON();
        expect(json.experimentId).toEqual("eac95021-a637-443e-b4af-b6a59bda0f21");
        done();
      });
    });
  });
});
