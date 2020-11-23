import DistanceResultParser from "../../../src/server/helpers/results/DistanceResultParser";
import DISTANCE from "../../fixtures/files/Distance_Results.json";
import LARGE_DISTANCE from "../../fixtures/files/large-distance-result.json";

describe("DistanceResultParser", () => {
  describe("#parse", () => {
    describe("when valid", () => {
      describe("with a standard distance result", () => {
        it("should parse a result", done => {
          const parser = new DistanceResultParser(DISTANCE);
          const result = parser.parse();

          expect(result).toHaveProperty("type", "distance");
          expect(result).toHaveProperty("received");
          expect(result).toHaveProperty("experiments");

          expect(result.experiments.length).toEqual(2);

          done();
        });

        it("should create distances array", done => {
          const parser = new DistanceResultParser(DISTANCE);
          const result = parser.parse();
          const distances = result.experiments;

          expect(distances.length).toEqual(2);
          distances.forEach(distance => {
            expect(distance).toHaveProperty("sampleId");
            expect(distance).toHaveProperty("leafId");
            expect(distance).toHaveProperty("distance");
          });

          done();
        });
      });
      describe("with a large distance result", () => {
        it("should parse a result", done => {
          const parser = new DistanceResultParser(LARGE_DISTANCE);
          const result = parser.parse();

          expect(result).toHaveProperty("type", "distance");
          expect(result).toHaveProperty("received");
          expect(result).toHaveProperty("experiments");

          expect(result.experiments.length).toEqual(37955);

          done();
        });
      });
    });
  });
});
