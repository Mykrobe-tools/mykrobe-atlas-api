import Constants from "../../Constants";
import ResultParser from "./ResultParser";
import { parseCluster } from "./util";
import logger from "../../modules/logging/logger";

class ClusterResultParser extends ResultParser {
  constructor(namedResult) {
    super(namedResult);
  }

  parse() {
    const result = {
      type: "cluster",
      received: new Date()
    };

    if (this.namedResult.result) {
      const clusterResult = this.namedResult.result;
      result.nodes = parseCluster(clusterResult);
      result.distance = clusterResult.distance;
    }

    return result;
  }
}

export default ClusterResultParser;
