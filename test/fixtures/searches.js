import moment from "moment";
export default {
  full: {
    sequence: {
      type: "sequence",
      result: {
        ERR017683: {
          percent_kmers_found: 100
        },
        ERR1149371: {
          percent_kmers_found: 90
        },
        ERR1163331: {
          percent_kmers_found: 100
        }
      },
      bigsi: {
        seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
        threshold: 90
      },
      status: "complete",
      expires: new Date()
    },
    proteinVariant: {
      type: "protein-variant",
      result: {
        id: "5c6cfa45b7d623943564191a",
        type: "protein-variant",
        received: "2020-12-09T15:22:29.580Z",
        reference: "/config/NC_000962.3.fasta",
        ref: "S",
        pos: 450,
        alt: "L",
        genebank: null,
        gene: "rpoB",
        completedBigsiQueries: 2,
        totalBigsiQueries: 1,
        results: [
          { sampleId: "SRR1229544", genotype: "0/0" },
          { sampleId: "SRR1792504", genotype: "0/0" },
          { sampleId: "SRR1173815", genotype: "0/0" },
          { sampleId: "ERR133938", genotype: "0/0" },
          { sampleId: "ERR550906", genotype: "1/1" },
          { sampleId: "ERR1213887", genotype: "1/1" }
        ]
      },
      bigsi: {
        query: {
          gene: "rpoB",
          ref: "S",
          pos: 450,
          alt: "L"
        },
        type: "protein-variant"
      },
      status: "complete"
    },
    emptySequence: {
      type: "sequence",
      bigsi: {
        type: "sequence",
        query: {
          seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
          threshold: 50
        }
      }
    }
  },
  searchOnly: {
    sequence: {
      type: "sequence",
      bigsi: {
        type: "sequence",
        query: {
          seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
          threshold: 90
        }
      },
      status: "pending",
      expires: moment().toISOString()
    },
    proteinVariant: {
      type: "protein-variant",
      bigsi: {
        type: "protein-variant",
        query: {
          ref: "S",
          alt: "L",
          pos: 450,
          gene: "rpoB"
        }
      },
      status: "pending"
    },
    dnaVariant: {
      type: "dna-variant",
      bigsi: {
        type: "dna-variant",
        query: {
          ref: "G",
          pos: 4346385,
          alt: "C"
        }
      },
      status: "pending"
    },
    pendingSearch: {
      type: "sequence",
      bigsi: {
        type: "sequence",
        query: {
          seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
          threshold: 90
        }
      },
      status: "pending",
      expires: moment([2018, 9, 18]).toISOString()
    },
    completeSearch: {
      type: "sequence",
      bigsi: {
        type: "sequence",
        query: {
          seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
          threshold: 90
        }
      },
      status: "complete",
      expires: moment([2018, 9, 18]).toISOString()
    },
    expiredSearch: {
      type: "sequence",
      bigsi: {
        type: "sequence",
        query: {
          seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
          threshold: 90
        }
      },
      status: "pending",
      expires: moment([2018, 9, 18]).toISOString()
    }
  },
  results: {
    sequence: {
      type: "sequence",
      result: {
        id: "a699c1ecde6f6e6787990eed9",
        reference: "/data/NC_000961.4.fasta",
        threshold: 90,
        seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
        completed_bigsi_queries: 2,
        total_bigsi_queries: 1,
        results: [
          {
            sample_name: "ERR017683",
            percent_kmers_found: 100
          },
          {
            sample_name: "ERR1149371",
            percent_kmers_found: 90
          },
          {
            sample_name: "ERR1163331",
            percent_kmers_found: 100
          }
        ]
      },
      bigsi: {
        type: "sequence",
        query: {
          query: {
            seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
            threshold: 0.9
          }
        }
      }
    },
    emptySequence: {
      type: "sequence",
      result: {},
      bigsi: {
        type: "sequence",
        query: {
          query: {
            seq: "CAGATC",
            threshold: 0.9
          }
        }
      }
    },
    dnaVariant: {
      type: "dna-variant",
      result: {
        id: "a699c1ecde6f6e6713190eed9",
        reference: "/data/NC_000961.4.fasta",
        ref: "G",
        pos: 4346385,
        alt: "C",
        genbank: null,
        gene: null,
        completed_bigsi_queries: 2,
        total_bigsi_queries: 1,
        results: [
          {
            sample_name: "HN079",
            genotype: "1/1"
          },
          {
            sample_name: "SAMN06092584",
            genotype: "1/1"
          }
        ]
      }
    },
    dnaVariantWith0Genotype: {
      type: "dna-variant",
      result: {
        id: "a699c1ecde6f6e6713190eed9",
        reference: "/data/NC_000961.4.fasta",
        ref: "G",
        pos: 4346385,
        alt: "C",
        genbank: null,
        gene: null,
        completed_bigsi_queries: 2,
        total_bigsi_queries: 1,
        results: [
          {
            sample_name: "HN079",
            genotype: "1/1"
          },
          {
            sample_name: "SAMN06092584",
            genotype: "1/1"
          },
          {
            sample_name: "SAMN06092583",
            genotype: "0/0"
          }
        ]
      }
    },
    proteinVariant: {
      type: "protein-variant",
      result: {
        id: "a699c1eaee6f6e618910eed9",
        reference: "/data/NC_000962.3.fasta",
        ref: "S",
        pos: 450,
        alt: "L",
        genbank: null,
        gene: "rpoB",
        completed_bigsi_queries: 3,
        total_bigsi_queries: 1,
        results: [
          {
            sample_name: "HN081",
            genotype: "1/1"
          },
          {
            sample_name: "SAMN06192378",
            genotype: "1/1"
          }
        ]
      }
    },
    proteinVariantWith0Genotype: {
      type: "protein-variant",
      result: {
        id: "a699c1eaee6f6e618910eed9",
        reference: "/data/NC_000962.3.fasta",
        ref: "S",
        pos: 450,
        alt: "L",
        genbank: null,
        gene: "rpoB",
        completed_bigsi_queries: 3,
        total_bigsi_queries: 1,
        results: [
          {
            sample_name: "HN081",
            genotype: "1/1"
          },
          {
            sample_name: "SAMN06192378",
            genotype: "1/1"
          },
          {
            sample_name: "SAMN06192379",
            genotype: "0/0"
          }
        ]
      }
    }
  }
};
