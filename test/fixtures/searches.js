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
        type: "protein-variant",
        query: {
          ref: "S",
          alt: "L",
          pos: 450,
          gene: "rpoB"
        }
      },
      status: "complete"
    },
    emptySequence: {
      type: "sequence",
      bigsi: {
        type: "sequence",
        query: {
          seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
          threshold: 0.5
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
        type: "sequence",
        query: {
          query: {
            seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA",
            threshold: 0.9
          }
        }
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
      bigsi: {
        type: "protein-variant",
        query: {
          ref: "S",
          alt: "L",
          pos: 450,
          gene: "rpoB"
        }
      }
    }
  }
};
