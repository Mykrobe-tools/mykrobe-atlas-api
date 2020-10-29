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
    it("should transform lineages", () => {
      const json = new ResultsJSONTransformer().transform(results.lineages);

      expect(json).toHaveProperty("phylogenetics");
      const phylogenetics = json.phylogenetics;

      expect(phylogenetics).toHaveProperty("phylo_group");
      expect(phylogenetics.phylo_group).toHaveProperty("Mycobacterium_tuberculosis_complex");
      expect(phylogenetics.phylo_group.Mycobacterium_tuberculosis_complex).toHaveProperty(
        "percent_coverage",
        99.655
      );
      expect(phylogenetics.phylo_group.Mycobacterium_tuberculosis_complex).toHaveProperty(
        "median_depth",
        87.0
      );

      expect(phylogenetics).toHaveProperty("sub_complex");
      expect(phylogenetics.sub_complex).toHaveProperty("Unknown");
      expect(phylogenetics.sub_complex.Unknown).toHaveProperty("percent_coverage", -1);
      expect(phylogenetics.sub_complex.Unknown).toHaveProperty("median_depth", -1);

      expect(phylogenetics).toHaveProperty("species");
      expect(phylogenetics.species).toHaveProperty("Mycobacterium_tuberculosis");
      expect(phylogenetics.species.Mycobacterium_tuberculosis).toHaveProperty(
        "percent_coverage",
        98.312
      );
      expect(phylogenetics.species.Mycobacterium_tuberculosis).toHaveProperty("median_depth", 82.0);

      expect(phylogenetics).toHaveProperty("lineage");
      expect(phylogenetics.lineage).toHaveProperty("lineage");
      expect(phylogenetics.lineage).toHaveProperty("calls_summary");
      expect(phylogenetics.lineage).toHaveProperty("calls");
    });
  });
});
