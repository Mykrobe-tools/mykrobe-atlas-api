import DnaVariantResultParser from "../../../src/server/helpers/results/DnaVariantResultParser";
import searches from "../../fixtures/searches";

describe("DnaVariantResultParser", () => {
  describe("#parse", () => {
    it("should parse a result", done => {
      const parser = new DnaVariantResultParser(searches.results.dnaVariant);
      const parsedResult = parser.parse();

      expect(parsedResult).toHaveProperty("type", "dna-variant");

      expect(parsedResult).toHaveProperty("received");
      expect(parsedResult.received).toBeTruthy();

      expect(parsedResult).toHaveProperty("results");
      expect(parsedResult).toHaveProperty("reference", "/data/NC_000961.4.fasta");
      expect(parsedResult).toHaveProperty("ref", "G");
      expect(parsedResult).toHaveProperty("pos", 4346385);
      expect(parsedResult).toHaveProperty("alt", "C");
      expect(parsedResult).toHaveProperty("genebank", null);
      expect(parsedResult).toHaveProperty("gene", null);
      expect(parsedResult).toHaveProperty("completedBigsiQueries", 2);
      expect(parsedResult).toHaveProperty("totalBigsiQueries", 1);

      expect(parsedResult).toHaveProperty("results");
      const results = parsedResult.results;
      expect(results.length).toEqual(2);
      results.forEach(entry => {
        const sampleId = entry.sampleId;
        const genotype = entry.genotype;

        expect(["HN079", "SAMN06092584"].includes(sampleId)).toEqual(true);
        expect(genotype).toEqual("1/1");
      });

      done();
    });
  });
});
