import PredictorResultParser from "./PredictorResultParser";
import NearestNeighboursResultParser from "./NearestNeighboursResultParser";
import { buildRandomDistanceResult } from "../modules/resultsUtil";

/**
 * A factory class class to create results parser
 */
class ResultsParserFactory {
  static async create(result) {
    if (result.type === "predictor") {
      return new PredictorResultParser(result);
    } else if (result.type === "distance") {
      // temporary solution
      const randomResult = await buildRandomDistanceResult();
      return new NearestNeighboursResultParser(randomResult);
    }
    return null;
  }
}

export default ResultsParserFactory;
