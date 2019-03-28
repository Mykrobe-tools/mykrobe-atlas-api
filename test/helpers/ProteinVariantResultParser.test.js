import ProteinVariantResultParser from "../../src/server/helpers/ProteinVariantResultParser";
import searches from "../fixtures/searches";

describe("ProteinVariantResultParser", () => {
  describe("#parse", () => {
    it("should parse a result", done => {
      const parser = new ProteinVariantResultParser(searches.results.proteinVariant);
      const result = parser.parse();

      expect(result).toHaveProperty("type", "protein-variant");

      expect(result).toHaveProperty("received");
      expect(result.received).toBeTruthy();

      expect(result).toHaveProperty("result");
      expect(Object.keys(result.result).length).toEqual(6);

      done();
    });
  });
});
