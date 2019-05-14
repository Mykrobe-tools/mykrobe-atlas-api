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
      hash: "62b982cf54332c4ca2fbb9e670e6aad2ac0ab427"
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
      hash: "f13efe3c6fb77cac5fab23f8bd789050f3a52064",
      expires: moment().toISOString()
    },
    proteinVariant: {
      type: "protein-variant",
      bigsi: {
        ref: "S",
        alt: "L",
        pos: 450,
        gene: "rpoB"
      },
      status: "pending",
      hash: "62b982cf54332c4ca2fbb9e670e6aad2ac0ab427",
      expires: moment().toISOString()
    },
    expiredSearch: {
      type: "sequence",
      bigsi: {
        seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
        threshold: 0.9
      },
      status: "pending",
      expires: moment([2018, 9, 18]).toISOString()
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
