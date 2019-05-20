import NearestNeighbourResultParser from "../../../src/server/helpers/results/NearestNeighbourResultParser";
import NEAREST_NEIGHBOURS from "../../fixtures/files/NEAREST_NEIGHBOURS_Results.json";

describe("NearestNeighbourResultParser", () => {
  describe("#parse", () => {
    it("should parse a result", done => {
      const parser = new NearestNeighbourResultParser(NEAREST_NEIGHBOURS);
      const result = parser.parse();

      expect(result).toHaveProperty("type", "distance");
      expect(result).toHaveProperty("subType", "nearest-neighbour");
      expect(result).toHaveProperty("received");
      expect(result).toHaveProperty("experiments");

      expect(result.experiments.length).toEqual(9);

      done();
    });

    it("should create nearest neighbours array", done => {
      const parser = new NearestNeighbourResultParser(NEAREST_NEIGHBOURS);
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
