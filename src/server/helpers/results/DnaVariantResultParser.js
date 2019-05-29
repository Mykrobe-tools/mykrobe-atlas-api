import ResultParser from "./ResultParser";

class DnaVariantResultParser extends ResultParser {
  constructor(result) {
    super(result);
  }

  parse() {
    const result = {
      type: "dna-variant",
      received: new Date()
    };
    if (this.namedResult && this.namedResult.result) {
      const container = this.namedResult.result;
      delete container.query;
      // single mutation only
      const mutation = Object.keys(container).pop();
      if (mutation) {
        result.result = container[mutation];
      }
    }

    return result;
  }
}

export default DnaVariantResultParser;