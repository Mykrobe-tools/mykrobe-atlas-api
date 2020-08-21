import ResultParser from "./ResultParser";
import { parseDistance } from "./util";

class DistanceResultParser extends ResultParser {
  constructor(namedResult) {
    super(namedResult);
  }

  parse() {
    const result = {
      type: "distance",
      received: new Date()
    };

    result.analysed = this.namedResult.analysed ? this.namedResult.analysed : result.received;
    result.leafId = this.namedResult.leafId;

    if (this.namedResult.result) {
      const distanceResult = this.namedResult.result;
      result.experiments = parseDistance(distanceResult);
    }

    return result;
  }
}

export default DistanceResultParser;
