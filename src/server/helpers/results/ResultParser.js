import logger from "../../modules/logging/logger";
class ResultParser {
  constructor(namedResult) {
    this.namedResult = namedResult;
  }

  parse() {
    throw new Error("The parse method must be implemented");
  }

  getStatus(result) {
    if (result && result.status) {
      return result.status;
    }
    return "success";
  }
}

export default ResultParser;
