import DistanceCompletedJSONTransformer from "../../../src/server/transformers/events/DistanceCompletedJSONTransformer";

const data = {
  status: "success",
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
  type: "distance"
};

describe("DistanceCompleteJSONTransformer", () => {
  describe("#transform", () => {
    let json = null;
    beforeEach(done => {
      json = new DistanceCompletedJSONTransformer().transform(data, {});
      done();
    });
    it("should return an id", () => {
      expect(json).toHaveProperty("id", "5b6433e4fde486245d5f0f94");
    });
    it("should return an experiment url", () => {
      expect(json).toHaveProperty("getURL", "/experiments/5b6433e4fde486245d5f0f94");
    });
    it("should return a status", () => {
      expect(json).toHaveProperty("status", "success");
    });
    it("should return an event", () => {
      expect(json).toHaveProperty("event", "Distance search complete");
    });
  });
});
