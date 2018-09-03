import PredictorResultParser from "./PredictorResultParser";
import NearestNeighboursResultParser from "./NearestNeighboursResultParser";

/**
 * A factory class class to create results parser
 */
class ResultsParserFactory {
  static create(result) {
    if (result.type === "predictor") {
      return new PredictorResultParser(result);
    } else if (
      result.type === "distance" &&
      result.subType === "Nearest neighbours"
    ) {
      return new NearestNeighboursResultParser(result);
    }
    return null;
  }
}

export default ResultsParserFactory;
