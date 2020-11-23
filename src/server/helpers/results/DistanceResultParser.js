import Constants from "../../Constants";
import ResultParser from "./ResultParser";
import { parseDistance } from "./util";
import logger from "../../modules/logging/logger";

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
      if (this.isOversizedResultSet()) {
        this.namedResult.result = this.truncateResult();
      }

      const distanceResult = this.namedResult.result;
      result.experiments = parseDistance(distanceResult);
    }

    return result;
  }

  isOversizedResultSet() {
    if (Array.isArray(this.namedResult.result)) {
      const size = this.namedResult.result.length;
      logger.info(`DistanceResultParser#isOversizedResultSet: result size ${size} items`);
      return size > Constants.DISTANCE_RESULT_SIZE_THRESHOLD;
    }
    return false;
  }

  truncateResult() {
    const size = this.namedResult.result.length;
    logger.warn(
      `DistanceResultParser#truncateResult: Truncating ${size} distance results to ${Constants.DISTANCE_RESULT_SIZE_THRESHOLD}`
    );
    const distanceResult = this.namedResult.result;
    return distanceResult.slice(0, Constants.DISTANCE_RESULT_SIZE_THRESHOLD);
  }
}

export default DistanceResultParser;
