import SequenceResultParser from "../../src/server/helpers/SequenceResultParser";
import searches from "../fixtures/searches";

describe("SequenceResultParser", () => {
  describe("#parse", () => {
    it("should parse a result", done => {
      const parser = new SequenceResultParser(searches.results.sequence);
      const result = parser.parse();

      expect(result).toHaveProperty("type", "sequence");

      expect(result).toHaveProperty("received");
      expect(result.received).toBeTruthy();

      expect(result).toHaveProperty("result");
      expect(Object.keys(result.result).length).toEqual(3);

      done();
    });
  });
});
