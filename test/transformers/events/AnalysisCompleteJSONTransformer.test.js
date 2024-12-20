import AnalysisCompleteJSONTransformer from "../../../src/server/transformers/events/AnalysisCompleteJSONTransformer";

const data = {
  taskId: "e986f350-970b-11e8-8b76-7d2b3faf02cf",
  fileLocation: "/home/admin/MDR.fastq.gz",
  experiment: {
    id: "5b6433e4fde486245d5f0f94",
    results: {
      predictor: {
        type: "predictor",
        received: "2018-08-03T10:57:30.809Z",
        probeSets: [
          "/home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-species-170421.fasta.gz",
          "/home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-walker-probe-set-feb-09-2017.fasta.gz"
        ],
        files: ["/atlas/test-data/MDR.fastq.gz"],
        susceptibility: [
          {
            _id: "5b473a285fb3651c8818b337",
            name: "Isoniazid"
          }
        ]
      }
    }
  },
  type: "predictor"
};

describe("AnalysisCompleteJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the analysis complete event", done => {
      const json = new AnalysisCompleteJSONTransformer().transform(data, {});

      expect(json.id).toEqual("5b6433e4fde486245d5f0f94");
      expect(json.taskId).toEqual("e986f350-970b-11e8-8b76-7d2b3faf02cf");
      expect(json.file).toEqual("MDR.fastq.gz");
      expect(json.type).toEqual("predictor");
      expect(json.event).toEqual("Analysis complete");
      expect(json.results).toEqual(data.experiment.results);

      done();
    });
  });
});
