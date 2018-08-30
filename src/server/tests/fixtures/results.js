export default {
  mdr: {
    probeSets: [
      "/home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-species-170421.fasta.gz",
      "/home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-walker-probe-set-feb-09-2017.fasta.gz"
    ],
    files: ["/atlas/test-data/MDR.fastq.gz"],
    susceptibility: [
      {
        _id: "5b473a285fb3651c8818b337",
        name: "Isoniazid",
        prediction: "R",
        calledBy: {
          "katG_S315T-S315T": {
            variant: null,
            genotype: [1, 1],
            genotype_likelihoods: [-99999999, -99999999, -5.134421217109032],
            info: {
              coverage: {
                reference: {
                  percent_coverage: 4.55,
                  median_depth: 0,
                  min_non_zero_depth: 42,
                  kmer_count: 42
                },
                alternate: {
                  percent_coverage: 100,
                  median_depth: 43,
                  min_non_zero_depth: 40,
                  kmer_count: 974
                }
              },
              expected_depths: [55],
              contamination_depths: [],
              filter: "PASS",
              conf: 99999994
            },
            _cls: "Call.VariantCall"
          }
        }
      },
      {
        _id: "5b473a285fb3651c8818b336",
        name: "Kanamycin",
        prediction: "S"
      },
      {
        _id: "5b473a285fb3651c8818b335",
        name: "Ethambutol",
        prediction: "S"
      },
      {
        _id: "5b473a285fb3651c8818b334",
        name: "Streptomycin",
        prediction: "S"
      },
      {
        _id: "5b473a285fb3651c8818b333",
        name: "Capreomycin",
        prediction: "S"
      },
      {
        _id: "5b473a285fb3651c8818b332",
        name: "Quinolones",
        prediction: "S"
      },
      {
        _id: "5b473a285fb3651c8818b331",
        name: "Pyrazinamide",
        prediction: "S"
      },
      {
        _id: "5b473a285fb3651c8818b330",
        name: "Rifampicin",
        prediction: "R",
        calledBy: {
          "rpoB_S450L-S450L": {
            variant: null,
            genotype: [1, 1],
            genotype_likelihoods: [-99999999, -99999999, -3.9522668043080196],
            info: {
              coverage: {
                reference: {
                  percent_coverage: 4.55,
                  median_depth: 0,
                  min_non_zero_depth: 48,
                  kmer_count: 48
                },
                alternate: {
                  percent_coverage: 100,
                  median_depth: 51,
                  min_non_zero_depth: 48,
                  kmer_count: 1109
                }
              },
              expected_depths: [55],
              contamination_depths: [],
              filter: "PASS",
              conf: 99999995
            },
            _cls: "Call.VariantCall"
          }
        }
      },
      {
        _id: "5b473a285fb3651c8818b32f",
        name: "Amikacin",
        prediction: "S"
      }
    ],
    phylogenetics: [
      {
        _id: "5b473a285fb3651c8818b33b",
        type: "phylo_group",
        result: "Mycobacterium_tuberculosis_complex",
        percentCoverage: 99.631,
        medianDepth: 55
      },
      {
        _id: "5b473a285fb3651c8818b33a",
        type: "sub_complex",
        result: "Unknown",
        percentCoverage: -1,
        medianDepth: -1
      },
      {
        _id: "5b473a285fb3651c8818b339",
        type: "species",
        result: "Mycobacterium_tuberculosis",
        percentCoverage: 97.744,
        medianDepth: 51
      },
      {
        _id: "5b473a285fb3651c8818b338",
        type: "lineage",
        result: "European_American",
        percentCoverage: 100,
        medianDepth: 47
      }
    ],
    type: "predictor",
    received: "2018-07-12T11:23:20.964Z",
    analysed: "2018-07-12T11:23:20.964Z",
    kmer: 21,
    version: {
      "mykrobe-predictor": "v0.6.5",
      "mykrobe-atlas": "v0.6.5"
    },
    genotypeModel: "median_depth",
    id: "5b473a285fb3651c8818b32e",
    variantCalls: {
      "ahpC_C-57T-C2726136T": {
        variant:
          "ref-C-57T?var_name=C2726136T&num_alts=18&ref=NC_000962.3&enum=0&gene=ahpC&mut=C-57T",
        genotype: [0, 0],
        genotype_likelihoods: [-3.947633340727132, -99999999, -99999999],
        info: {
          coverage: {
            reference: {
              percent_coverage: 100.0,
              median_depth: 58,
              min_non_zero_depth: 52,
              kmer_count: 1268
            },
            alternate: {
              percent_coverage: 9.09,
              median_depth: 0,
              min_non_zero_depth: 64,
              kmer_count: 128
            }
          },
          expected_depths: [55],
          contamination_depths: [],
          filter: "PASS",
          conf: 99999995
        },
        _cls: "Call.VariantCall"
      }
    },
    sequenceCalls: {
      a: "b"
    }
  },
  distance: {
    probeSets: [
      "/home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-species-170421.fasta.gz",
      "/home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-walker-probe-set-feb-09-2017.fasta.gz"
    ],
    files: ["/atlas/test-data/MDR.fastq.gz"],
    susceptibility: [
      {
        _id: "5b473a285fb3651c8818b337",
        name: "Isoniazid",
        prediction: "R",
        calledBy: {
          "katG_S315T-S315T": {
            variant: null,
            genotype: [1, 1],
            genotype_likelihoods: [-99999999, -99999999, -5.134421217109032],
            info: {
              coverage: {
                reference: {
                  percent_coverage: 4.55,
                  median_depth: 0,
                  min_non_zero_depth: 42,
                  kmer_count: 42
                },
                alternate: {
                  percent_coverage: 100,
                  median_depth: 43,
                  min_non_zero_depth: 40,
                  kmer_count: 974
                }
              },
              expected_depths: [55],
              contamination_depths: [],
              filter: "PASS",
              conf: 99999994
            },
            _cls: "Call.VariantCall"
          }
        }
      },
      {
        _id: "5b473a285fb3651c8818b336",
        name: "Kanamycin",
        prediction: "S"
      },
      {
        _id: "5b473a285fb3651c8818b332",
        name: "Quinolones",
        prediction: "S"
      },
      {
        _id: "5b473a285fb3651c8818b331",
        name: "Pyrazinamide",
        prediction: "S"
      },
      {
        _id: "5b473a285fb3651c8818b330",
        name: "Rifampicin",
        prediction: "R",
        calledBy: {
          "rpoB_S450L-S450L": {
            variant: null,
            genotype: [1, 1],
            genotype_likelihoods: [-99999999, -99999999, -3.9522668043080196],
            info: {
              coverage: {
                reference: {
                  percent_coverage: 4.55,
                  median_depth: 0,
                  min_non_zero_depth: 48,
                  kmer_count: 48
                },
                alternate: {
                  percent_coverage: 100,
                  median_depth: 51,
                  min_non_zero_depth: 48,
                  kmer_count: 1109
                }
              },
              expected_depths: [55],
              contamination_depths: [],
              filter: "PASS",
              conf: 99999995
            },
            _cls: "Call.VariantCall"
          }
        }
      },
      {
        _id: "5b473a285fb3651c8818b32f",
        name: "Amikacin",
        prediction: "S"
      }
    ],
    phylogenetics: [
      {
        _id: "5b473a285fb3651c8818b33b",
        type: "phylo_group",
        result: "Mycobacterium_tuberculosis_complex",
        percentCoverage: 99.631,
        medianDepth: 55
      },
      {
        _id: "5b473a285fb3651c8818b338",
        type: "lineage",
        result: "European_American",
        percentCoverage: 100,
        medianDepth: 47
      }
    ],
    type: "distance",
    received: "2018-07-12T11:23:20.964Z",
    analysed: "2018-07-01T11:23:20.964Z",
    kmer: 21,
    version: {
      "mykrobe-predictor": "v0.6.5",
      "mykrobe-atlas": "v0.6.5"
    },
    genotypeModel: "median_depth",
    id: "5b473a285fb3651c8818b32e",
    variantCalls: {
      "ahpC_C-57T-C2726136T": {
        variant:
          "ref-C-57T?var_name=C2726136T&num_alts=18&ref=NC_000962.3&enum=0&gene=ahpC&mut=C-57T",
        genotype: [0, 0],
        genotype_likelihoods: [-3.947633340727132, -99999999, -99999999],
        info: {
          coverage: {
            reference: {
              percent_coverage: 100.0,
              median_depth: 58,
              min_non_zero_depth: 52,
              kmer_count: 1268
            },
            alternate: {
              percent_coverage: 9.09,
              median_depth: 0,
              min_non_zero_depth: 64,
              kmer_count: 128
            }
          },
          expected_depths: [55],
          contamination_depths: [],
          filter: "PASS",
          conf: 99999995
        },
        _cls: "Call.VariantCall"
      }
    },
    sequenceCalls: {
      a: "b"
    }
  },
  predictor: {
    probeSets: [
      "/home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-species-170421.fasta.gz",
      "/home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-walker-probe-set-feb-09-2017.fasta.gz"
    ],
    files: ["/atlas/test-data/MDR.fastq.gz"],
    susceptibility: [
      {
        _id: "5b473a285fb3651c8818b337",
        name: "Isoniazid",
        prediction: "R",
        calledBy: {
          "katG_S315T-S315T": {
            variant: null,
            genotype: [1, 1],
            genotype_likelihoods: [-99999999, -99999999, -5.134421217109032],
            info: {
              coverage: {
                reference: {
                  percent_coverage: 4.55,
                  median_depth: 0,
                  min_non_zero_depth: 42,
                  kmer_count: 42
                },
                alternate: {
                  percent_coverage: 100,
                  median_depth: 43,
                  min_non_zero_depth: 40,
                  kmer_count: 974
                }
              },
              expected_depths: [55],
              contamination_depths: [],
              filter: "PASS",
              conf: 99999994
            },
            _cls: "Call.VariantCall"
          }
        }
      },
      {
        _id: "5b473a285fb3651c8818b331",
        name: "Pyrazinamide",
        prediction: "S"
      },
      {
        _id: "5b473a285fb3651c8818b330",
        name: "Rifampicin",
        prediction: "R",
        calledBy: {
          "rpoB_S450L-S450L": {
            variant: null,
            genotype: [1, 1],
            genotype_likelihoods: [-99999999, -99999999, -3.9522668043080196],
            info: {
              coverage: {
                reference: {
                  percent_coverage: 4.55,
                  median_depth: 0,
                  min_non_zero_depth: 48,
                  kmer_count: 48
                },
                alternate: {
                  percent_coverage: 100,
                  median_depth: 51,
                  min_non_zero_depth: 48,
                  kmer_count: 1109
                }
              },
              expected_depths: [55],
              contamination_depths: [],
              filter: "PASS",
              conf: 99999995
            },
            _cls: "Call.VariantCall"
          }
        }
      },
      {
        _id: "5b473a285fb3651c8818b32f",
        name: "Amikacin",
        prediction: "S"
      }
    ],
    phylogenetics: [
      {
        _id: "5b473a285fb3651c8818b33b",
        type: "phylo_group",
        result: "Mycobacterium_tuberculosis_complex",
        percentCoverage: 99.631,
        medianDepth: 55
      },
      {
        _id: "5b473a285fb3651c8818b338",
        type: "lineage",
        result: "European_American",
        percentCoverage: 100,
        medianDepth: 47
      }
    ],
    type: "predictor",
    received: "2018-09-12T11:23:20.964Z",
    analysed: "2018-09-12T11:23:20.964Z",
    kmer: 21,
    version: {
      "mykrobe-predictor": "v0.6.5",
      "mykrobe-atlas": "v0.6.5"
    },
    genotypeModel: "median_depth",
    id: "5b473a285fb3651c881812ac",
    variantCalls: {
      "ahpC_C-57T-C2726136T": {
        variant:
          "ref-C-57T?var_name=C2726136T&num_alts=18&ref=NC_000962.3&enum=0&gene=ahpC&mut=C-57T",
        genotype: [0, 0],
        genotype_likelihoods: [-3.947633340727132, -99999999, -99999999],
        info: {
          coverage: {
            reference: {
              percent_coverage: 100.0,
              median_depth: 58,
              min_non_zero_depth: 52,
              kmer_count: 1268
            },
            alternate: {
              percent_coverage: 9.09,
              median_depth: 0,
              min_non_zero_depth: 64,
              kmer_count: 128
            }
          },
          expected_depths: [55],
          contamination_depths: [],
          filter: "PASS",
          conf: 99999995
        },
        _cls: "Call.VariantCall"
      }
    },
    sequenceCalls: {
      a: "b"
    }
  }
};
