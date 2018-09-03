import NearestNeighboursResultParser from "../../helpers/NearestNeighboursResultParser";
import NEAREST_NEIGHBOURS from "../fixtures/files/NEAREST_NEIGHBOURS_Results.json";

describe("NearestNeighboursResultParser", () => {
  describe("#parse", () => {
    it("should parse a result", done => {
      const parser = new NearestNeighboursResultParser(NEAREST_NEIGHBOURS);
      const result = parser.parse();

      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("subType");
      expect(result).toHaveProperty("received");
      expect(result).toHaveProperty("nearestNeighbours");

      expect(result.type).toEqual("distance");
      expect(result.subType).toEqual("Nearest neighbours");
      expect(result.nearestNeighbours.length).toEqual(9);

      done();
    });

    it("should create nearest neighbours array", done => {
      const parser = new NearestNeighboursResultParser(NEAREST_NEIGHBOURS);
      const result = parser.parse();
      const nearestNeighbours = result.nearestNeighbours;

      expect(nearestNeighbours.length).toEqual(9);
      nearestNeighbours.forEach(nearestNeighbour => {
        expect(nearestNeighbour).toHaveProperty("experimentId");
        expect(nearestNeighbour).toHaveProperty("distance");
      });

      done();
    });
  });
});
