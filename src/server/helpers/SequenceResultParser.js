import ResultParser from "./ResultParser";

class SequenceResultParser extends ResultParser {
  constructor(result) {
    super(result);
  }

  parse() {
    const result = {
      type: "sequence",
      received: new Date()
    };
    if (this.namedResult && this.namedResult.result) {
      result.result = this.namedResult.result;
    }

    return result;
  }
}

export default SequenceResultParser;
