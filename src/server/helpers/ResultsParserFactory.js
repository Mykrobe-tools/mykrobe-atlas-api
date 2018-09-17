import PredictorResultParser from "./PredictorResultParser";
import ProteinVariantResultParser from "./ProteinVariantResultParser";
import SequenceResultParser from "./SequenceResultParser";
import NearestNeighboursResultParser from "./NearestNeighboursResultParser";
import { buildRandomDistanceResult } from "../modules/resultsUtil";

/**
 * A factory class class to create results parser
 */
class ResultsParserFactory {
  static async create(result) {
    switch (result.type) {
      case "predictor":
        return new PredictorResultParser(result);

      case "distance":
        // temporary solution
        const randomResult = await buildRandomDistanceResult();
        return new NearestNeighboursResultParser(randomResult);

      case "sequence":
        return new SequenceResultParser(result);

      case "protein-variant":
        return new ProteinVariantResultParser(result);
    }

    return null;
  }
}

export default ResultsParserFactory;
