import NearestNeighboursResultParser from "../../src/server/helpers/NearestNeighboursResultParser";
import NEAREST_NEIGHBOURS from "../fixtures/files/NEAREST_NEIGHBOURS_Results.json";

describe("NearestNeighboursResultParser", () => {
  describe("#parse", () => {
    it("should parse a result", done => {
      const parser = new NearestNeighboursResultParser(NEAREST_NEIGHBOURS);
      const result = parser.parse();

      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("subType");
      expect(result).toHaveProperty("received");
      expect(result).toHaveProperty("experiments");

      expect(result.type).toEqual("nearestNeighbours");
      expect(result.subType).toEqual("Nearest neighbours");
      expect(result.experiments.length).toEqual(9);

      done();
    });

    it("should create nearest neighbours array", done => {
      const parser = new NearestNeighboursResultParser(NEAREST_NEIGHBOURS);
      const result = parser.parse();
      const nearestNeighbours = result.experiments;

      expect(nearestNeighbours.length).toEqual(9);
      nearestNeighbours.forEach(nearestNeighbour => {
        expect(nearestNeighbour).toHaveProperty("id");
        expect(nearestNeighbour).toHaveProperty("distance");
      });

      done();
    });
  });
});
