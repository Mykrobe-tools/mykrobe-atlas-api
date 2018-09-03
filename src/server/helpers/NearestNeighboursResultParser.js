import ResultParser from "./ResultParser";
import { calculateNearestNeighbours } from "../modules/resultsUtil";

class NearestNeighboursResultParser extends ResultParser {
  constructor(namedResult) {
    super(namedResult);
  }

  parse() {
    const result = {
      type: "distance",
      subType: "Nearest neighbours",
      received: new Date()
    };
    if (this.namedResult.result) {
      const nearestNeighboursResult = this.namedResult.result;
      result.nearestNeighbours = calculateNearestNeighbours(
        nearestNeighboursResult
      );
    }

    return result;
  }
}

export default NearestNeighboursResultParser;
