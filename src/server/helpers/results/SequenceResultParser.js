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
      const container = this.namedResult.result;
      result.seq = container.seq;
      result.threshold = container.threshold;
      result.completedBigsiQueries = container.completed_bigsi_queries;
      result.totalBigsiQueries = container.total_bigsi_queries;

      delete container.query;

      if (container.results) {
        const hits = container.results.map(hit => {
          return {
            sampleId: hit.sample_name,
            percentKmersFound: hit.percent_kmers_found
          };
        });
        result.results = hits;
      } else {
        result.results = [];
      }
    }

    return result;
  }
}

export default SequenceResultParser;
