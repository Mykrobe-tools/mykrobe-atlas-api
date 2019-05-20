import PredictorResultParser from "./PredictorResultParser";
import TreeDistanceResultParser from "./TreeDistanceResultParser";
import NearestNeighbourResultParser from "./NearestNeighbourResultParser";
import ProteinVariantResultParser from "./ProteinVariantResultParser";
import SequenceResultParser from "./SequenceResultParser";
import { buildRandomDistanceResult } from "./util";

/**
 * A factory class class to create results parser
 */
class ResultsParserFactory {
  static create(result) {
    switch (result.type) {
      case "predictor":
        return new PredictorResultParser(result);

      case "distance":
        const subType = result.subType;
        switch (subType) {
          case "nearest-neighbour":
            return new NearestNeighbourResultParser(result);
            break;
          case "tree-distance":
            return new TreeDistanceResultParser(result);
            break;
        }

      case "sequence":
        return new SequenceResultParser(result);

      case "protein-variant":
        return new ProteinVariantResultParser(result);
    }

    return null;
  }
}

export default ResultsParserFactory;
