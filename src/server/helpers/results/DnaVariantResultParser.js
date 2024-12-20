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
      result.reference = container.reference;
      result.ref = container.ref;
      result.pos = container.pos;
      result.alt = container.alt;
      result.genebank = container.genebank || null;
      result.gene = container.gene || null;
      result.completedBigsiQueries = container.completed_bigsi_queries;
      result.totalBigsiQueries = container.total_bigsi_queries;

      delete container.query;

      if (container.results) {
        const hits = container.results.map(hit => {
          return {
            sampleId: hit.sample_name,
            genotype: hit.genotype
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

export default DnaVariantResultParser;
