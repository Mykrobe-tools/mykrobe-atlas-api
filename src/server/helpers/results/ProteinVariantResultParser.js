import ResultParser from "./ResultParser";

class ProteinVariantResultParser extends ResultParser {
  constructor(result) {
    super(result);
  }

  parse() {
    const result = {
      type: "protein-variant",
      received: new Date()
    };
    if (this.namedResult && this.namedResult.result) {
      const container = this.namedResult.result;
      result.reference = container.reference;
      result.ref = container.ref;
      result.pos = container.pos;
      result.alt = container.alt;
      result.genebank = container.genebank || null;
      result.gene = container.gene || null;
      result.completedBigsiQueries = container.completed_bigsi_queries;
      result.totalBigsiQueries = container.total_bigsi_queries;

      delete container.query;

      const hits = container.results.map(hit => {
        return {
          "metadata.sample.isolateId": hit.sample_name,
          genotype: hit.genotype
        };
      });

      result.results = hits;
    }

    return result;
  }
}

export default ProteinVariantResultParser;
