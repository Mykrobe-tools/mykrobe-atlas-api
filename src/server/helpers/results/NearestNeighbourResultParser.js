import ResultParser from "./ResultParser";
import { parseDistance } from "./util";

class NearestNeighbourResultParser extends ResultParser {
  constructor(namedResult) {
    super(namedResult);
  }

  parse() {
    const result = {
      type: "distance",
      subType: "nearest-neighbour",
      received: new Date()
    };

    result.analysed = this.namedResult.analysed ? this.namedResult.analysed : result.received;

    if (this.namedResult.result) {
      const distanceResult = this.namedResult.result;
      result.experiments = parseDistance(distanceResult);
    }

    return result;
  }
}

export default NearestNeighbourResultParser;
