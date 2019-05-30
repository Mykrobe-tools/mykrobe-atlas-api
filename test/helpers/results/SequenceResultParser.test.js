import SequenceResultParser from "../../../src/server/helpers/results/SequenceResultParser";
import searches from "../../fixtures/searches";

describe("SequenceResultParser", () => {
  describe("#parse", () => {
    it("should parse a result", done => {
      const parser = new SequenceResultParser(searches.results.sequence);
      const result = parser.parse();

      expect(result).toHaveProperty("type", "sequence");

      expect(result).toHaveProperty("received");
      expect(result.received).toBeTruthy();

      expect(result).toHaveProperty("results");
      const results = result.results;
      expect(results.length).toEqual(3);

      done();
    });
  });
});
