import axios from "axios";

import AnalysisService from "../../../src/server/modules/analysis/AnalysisService";

jest.mock("axios");

describe("AnalysisService", () => {
  describe("#predictor", () => {
    describe("when invalid", () => {
      describe("when experiment is missing", () => {
        it("should throw an exception", done => {
          done();
        });
      });
      describe("when file is missing", () => {
        it("should throw an exception", done => {
          done();
        });
      });
      describe("when taskId is missing", () => {
        it("should throw an exception", async done => {
          axios.post.mockClear().mockImplementation(() => Promise.resolve({ data: {} }));
          const service = new AnalysisService();
          try {
            const response = await service.predictor(
              {
                id: "b8c81012-a227-4262-8289-28183e653532",
                files: [
                  {
                    name:
                      "/atlas/uploads/b8c81012-a227-4262-8289-28183e653532/INH_monoresistant.fastq.gz"
                  }
                ],
                sampleId: "9900f83b-41ab-4457-aafa-7a34a1e8ecac"
              },
              "/atlas/uploads/b8c81012-a227-4262-8289-28183e653532/INH_monoresistant.fastq.gz"
            );
            done("Error.  Should throw error");
          } catch (e) {
            expect(e.message).toEqual(`Call to predictor service failed.  Missing response`);
            done();
          }
        });
      });
    });
    describe("when valid", () => {
      describe("when taskId is provided", () => {
        let response = null;
        beforeEach(async done => {
          axios.post
            .mockClear()
            .mockImplementation(() =>
              Promise.resolve({ data: { task_id: "457abe90-5f7d-49e6-adbd-8ea3c12c5511" } })
            );
          const service = new AnalysisService();
          response = await service.predictor(
            {
              id: "b8c81012-a227-4262-8289-28183e653532",
              files: [
                {
                  name:
                    "/atlas/uploads/b8c81012-a227-4262-8289-28183e653532/INH_monoresistant.fastq.gz"
                }
              ],
              sampleId: "9900f83b-41ab-4457-aafa-7a34a1e8ecac"
            },
            "/atlas/uploads/b8c81012-a227-4262-8289-28183e653532/INH_monoresistant.fastq.gz"
          );

          done();
        });
        it("should call post", done => {
          expect(axios.post).toHaveBeenCalledTimes(1);
          done();
        });
        it("should call the analysis API URL", done => {
          const url = axios.post.mock.calls[0][0];
          expect(url).toEqual("https://cli.mykrobe.com/analyses");
          done();
        });
        it("should format the callback URL correctly", done => {
          const payload = axios.post.mock.calls[0][1];
          expect(payload).toHaveProperty(
            "callback_url",
            "/experiments/b8c81012-a227-4262-8289-28183e653532/results"
          );
          done();
        });
        it("should provide a localised file reference", done => {
          const payload = axios.post.mock.calls[0][1];
          expect(payload).toHaveProperty(
            "file",
            "/atlas/data/b8c81012-a227-4262-8289-28183e653532/INH_monoresistant.fastq.gz"
          );
          done();
        });
        it("should provide localised files references", done => {
          const payload = axios.post.mock.calls[0][1];
          expect(payload).toHaveProperty("files", [
            "/atlas/data/b8c81012-a227-4262-8289-28183e653532/INH_monoresistant.fastq.gz"
          ]);
          done();
        });
        it("should provide a sample id", done => {
          const payload = axios.post.mock.calls[0][1];
          expect(payload).toHaveProperty("sample_id", "9900f83b-41ab-4457-aafa-7a34a1e8ecac");
          done();
        });
        it("should return the taskId", done => {
          expect(response).toEqual("457abe90-5f7d-49e6-adbd-8ea3c12c5511");
          done();
        });
      });
    });
  });
});
