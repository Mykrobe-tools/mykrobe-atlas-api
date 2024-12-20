import AnalysisStartedJSONTransformer from "../../../src/server/transformers/events/AnalysisStartedJSONTransformer";

const data = {
  taskId: "e986f350-970b-11e8-8b76-7d2b3faf02cf",
  fileLocation: "/atlas/uploads/experiments/5b6433e4fde486245d5f0f94/file/MDR.fastq.gz",
  experiment: {
    id: "5b6433e4fde486245d5f0f94"
  }
};

describe("AnalysisStartedJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the analysis started event", done => {
      const json = new AnalysisStartedJSONTransformer().transform(data, {});

      expect(json.id).toEqual("5b6433e4fde486245d5f0f94");
      expect(json.taskId).toEqual("e986f350-970b-11e8-8b76-7d2b3faf02cf");
      expect(json.file).toEqual("MDR.fastq.gz");
      expect(json.event).toEqual("Analysis started");

      done();
    });
  });
});
