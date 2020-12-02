import ProteinVariantResultParser from "../../../src/server/helpers/results/ProteinVariantResultParser";
import searches from "../../fixtures/searches";

describe("ProteinVariantResultParser", () => {
  describe("#parse", () => {
    it("should parse a result", done => {
      const parser = new ProteinVariantResultParser(searches.results.proteinVariant);
      const parsedResult = parser.parse();

      expect(parsedResult).toHaveProperty("type", "protein-variant");

      expect(parsedResult).toHaveProperty("received");
      expect(parsedResult.received).toBeTruthy();

      expect(parsedResult).toHaveProperty("results");
      expect(parsedResult).toHaveProperty("reference", "/data/NC_000962.3.fasta");
      expect(parsedResult).toHaveProperty("ref", "S");
      expect(parsedResult).toHaveProperty("pos", 450);
      expect(parsedResult).toHaveProperty("alt", "L");
      expect(parsedResult).toHaveProperty("genebank", null);
      expect(parsedResult).toHaveProperty("gene", "rpoB");
      expect(parsedResult).toHaveProperty("completedBigsiQueries", 3);
      expect(parsedResult).toHaveProperty("totalBigsiQueries", 1);

      expect(parsedResult).toHaveProperty("results");
      const results = parsedResult.results;
      expect(results.length).toEqual(2);
      results.forEach(entry => {
        const sampleId = entry.sampleId;
        const genotype = entry.genotype;

        expect(["HN081", "SAMN06192378"].includes(sampleId)).toEqual(true);
        expect(genotype).toEqual("1/1");
      });

      done();
    });
  });
});
