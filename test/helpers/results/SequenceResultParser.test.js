import SequenceResultParser from "../../../src/server/helpers/results/SequenceResultParser";
import searches from "../../fixtures/searches";

describe("SequenceResultParser", () => {
  describe("#parse", () => {
    describe("when valid", () => {
      describe("when results exist", () => {
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
        it("should use sampleId", done => {
          const parser = new SequenceResultParser(searches.results.sequence);
          const result = parser.parse();

          expect(result).toHaveProperty("type", "sequence");

          expect(result).toHaveProperty("received");
          expect(result.received).toBeTruthy();

          expect(result).toHaveProperty("results");
          const { results } = result;

          results.forEach(item => {
            expect(item).toHaveProperty("sampleId");
            expect(item.sampleId).toBeTruthy();
          });

          done();
        });
      });
      describe("when results are empty", () => {
        it("should parse a result", done => {
          const parser = new SequenceResultParser(searches.results.emptySequence);
          const result = parser.parse();

          expect(result).toHaveProperty("type", "sequence");

          expect(result).toHaveProperty("received");
          expect(result.received).toBeTruthy();

          expect(result).toHaveProperty("results");
          const results = result.results;
          expect(results.length).toEqual(0);

          done();
        });
      });
    });
  });
});
