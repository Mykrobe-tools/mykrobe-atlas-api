import PredictorResultParser from "./PredictorResultParser";
import DistanceResultParser from "./DistanceResultParser";
import ProteinVariantResultParser from "./ProteinVariantResultParser";
import DnaVariantResultParser from "./DnaVariantResultParser";
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
        return new DistanceResultParser(result);

      case "sequence":
        return new SequenceResultParser(result);

      case "protein-variant":
        return new ProteinVariantResultParser(result);

      case "dna-variant":
        return new DnaVariantResultParser(result);
    }

    return null;
  }
}

export default ResultsParserFactory;
