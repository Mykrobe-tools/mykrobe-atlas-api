class ResultParser {
  constructor(namedResult) {
    this.namedResult = namedResult;
  }

  parse() {
    throw new Error("The parse method must be implemented");
  }
}

export default ResultParser;
