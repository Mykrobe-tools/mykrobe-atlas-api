export default {
  squence: {
    type: "sequence",
    resultId: "fceb43bb-2b5d-4546-affc-e91680c2f69a",
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
    resultId: "98da1f03-7ddc-414b-8150-d11d18723a84",
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
  },
  emptySequence: {
    type: "sequence",
    resultId: "0f3b4f77-c815-4e2a-8373-2c23e829c07a",
    query: {
      seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
      threshold: 0.5
    }
  }
};
