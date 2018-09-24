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
        threshold: 0.9
      },
      status: "complete",
      hash: "48f370a772c7496f6c9d2e6d92e920c87dd00a5d",
      expires: new Date()
    },
    proteinVariant: {
      type: "protein-variant",
      result: {
        rpoB_S450L: {
          SRR1229544: {
            genotype: "0/0",
            aa_mut: "S450L",
            variant: "TCG761154CTG",
            gene: "rpoB"
          },
          SRR1792504: {
            genotype: "0/0",
            aa_mut: "S450L",
            variant: "TCG761154CTG",
            gene: "rpoB"
          },
          SRR1173815: {
            genotype: "0/0",
            aa_mut: "S450L",
            variant: "TCG761154CTG",
            gene: "rpoB"
          },
          ERR133938: {
            genotype: "0/0",
            aa_mut: "S450L",
            variant: "TCG761154CTG",
            gene: "rpoB"
          },
          ERR550906: {
            genotype: "1/1",
            aa_mut: "S450L",
            variant: "TCG761154TTG",
            gene: "rpoB"
          },
          ERR1213887: {
            genotype: "1/1",
            aa_mut: "S450L",
            variant: "TCG761154TTG",
            gene: "rpoB"
          }
        }
      },
      bigsi: {
        ref: "S",
        alt: "L",
        pos: 450,
        gene: "rpoB"
      },
      status: "complete",
      hash: "48f370a772c7496f6c9d2e6d92e920c87dd00a5c"
    },
    emptySequence: {
      type: "sequence",
      bigsi: {
        seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
        threshold: 0.5
      }
    }
  },
  searchOnly: {
    sequence: {
      type: "sequence",
      bigsi: {
        seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
        threshold: 0.9
      },
      status: "pending",
      hash: "66b7d7e64871aa9fda1bdc8e88a28df797648d80",
      expires: new Date()
    },
    proteinVariant: {
      type: "protein-variant",
      bigsi: {
        ref: "S",
        alt: "L",
        pos: 450,
        gene: "rpoB"
      }
    },
    expiredSearch: {
      type: "sequence",
      bigsi: {
        seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
        threshold: 0.9
      },
      status: "pending",
      expires: "2018-09-18"
    }
  },
  results: {
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
      query: {
        seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
        threshold: 0.9
      }
    },
    proteinVariant: {
      type: "protein-variant",
      result: {
        rpoB_S450L: {
          SRR1229544: {
            genotype: "0/0",
            aa_mut: "S450L",
            variant: "TCG761154CTG",
            gene: "rpoB"
          },
          SRR1792504: {
            genotype: "0/0",
            aa_mut: "S450L",
            variant: "TCG761154CTG",
            gene: "rpoB"
          },
          SRR1173815: {
            genotype: "0/0",
            aa_mut: "S450L",
            variant: "TCG761154CTG",
            gene: "rpoB"
          },
          ERR133938: {
            genotype: "0/0",
            aa_mut: "S450L",
            variant: "TCG761154CTG",
            gene: "rpoB"
          },
          ERR550906: {
            genotype: "1/1",
            aa_mut: "S450L",
            variant: "TCG761154TTG",
            gene: "rpoB"
          },
          ERR1213887: {
            genotype: "1/1",
            aa_mut: "S450L",
            variant: "TCG761154TTG",
            gene: "rpoB"
          }
        }
      },
      query: {
        ref: "S",
        alt: "L",
        pos: 450,
        gene: "rpoB"
      }
    }
  }
};
