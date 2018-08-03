import AnalysisStartedJSONTransformer from "../../transformers/events/AnalysisStartedJSONTransformer";

const data = {
  taskId: "e986f350-970b-11e8-8b76-7d2b3faf02cf",
  fileLocation: "MDR.fastq.gz",
  sampleId: "5b6433e4fde486245d5f0f94"
};

describe("AnalysisStartedJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the analysis complete event", done => {
      const json = new AnalysisStartedJSONTransformer().transform(data, {
        id: "123"
      });

      expect(json.id).toEqual("123");
      expect(json.taskId).toEqual("e986f350-970b-11e8-8b76-7d2b3faf02cf");
      expect(json.file).toEqual("MDR.fastq.gz");
      expect(json.event).toEqual("Analysis started");

      done();
    });
  });
});
