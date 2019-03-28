import ResultsJSONTransformer from "../../src/server/transformers/ResultsJSONTransformer";

import results from "../fixtures/results";

describe("ResultsJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform results", done => {
      const json = new ResultsJSONTransformer().transform(results.mdr);

      expect(json).toHaveProperty("probeSets");
      expect(json).toHaveProperty("files");
      expect(json).toHaveProperty("susceptibility");
      expect(json).toHaveProperty("phylogenetics");
      expect(json).toHaveProperty("type");
      expect(json).toHaveProperty("received");
      expect(json).toHaveProperty("kmer");
      expect(json).toHaveProperty("version");
      expect(json).toHaveProperty("genotypeModel");

      expect(json).not.toHaveProperty("sequenceCalls");
      expect(json).not.toHaveProperty("variantCalls");

      done();
    });
  });
});
