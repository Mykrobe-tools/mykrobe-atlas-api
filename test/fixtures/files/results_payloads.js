export default {
  SUSCEPTIBLE_ALL: {
    type: "predictor",
    result: {
      "5b473a285fb3651c8818b32e": {
        susceptibility: {
          Isoniazid: {
            predict: "S"
          },
          Kanamycin: {
            predict: "S"
          },
          Ethambutol: {
            predict: "S"
          },
          Streptomycin: {
            predict: "S"
          },
          Capreomycin: {
            predict: "S"
          },
          Quinolones: {
            predict: "S"
          },
          Pyrazinamide: {
            predict: "S"
          },
          Amikacin: {
            predict: "S"
          },
          Rifampicin: {
            predict: "S"
          }
        },
        phylogenetics: {
          phylo_group: {
            Mycobacterium_tuberculosis_complex: {
              percent_coverage: 99.722,
              median_depth: 122
            }
          },
          sub_complex: {
            Unknown: {
              percent_coverage: -1,
              median_depth: -1
            }
          },
          species: {
            Mycobacterium_tuberculosis: {
              percent_coverage: 98.199,
              median_depth: 116
            }
          },
          lineage: {
            European_American: {
              percent_coverage: 100.0,
              median_depth: 117
            }
          }
        },
        kmer: 21,
        version: {
          "mykrobe-predictor": "v0.6.5",
          "mykrobe-atlas": "v0.6.5"
        },
        genotype_model: "median_depth"
      }
    }
  },
  ONE_FIRST_CLASS_RESISTANCE: {
    type: "predictor",
    result: {
      "5b473a285fb3651c8818b32e": {
        susceptibility: {
          Isoniazid: {
            predict: "R"
          },
          Kanamycin: {
            predict: "S"
          },
          Ethambutol: {
            predict: "S"
          },
          Streptomycin: {
            predict: "S"
          },
          Capreomycin: {
            predict: "S"
          },
          Quinolones: {
            predict: "S"
          },
          Pyrazinamide: {
            predict: "S"
          },
          Amikacin: {
            predict: "S"
          },
          Rifampicin: {
            predict: "S"
          }
        },
        phylogenetics: {
          phylo_group: {
            Mycobacterium_tuberculosis_complex: {
              percent_coverage: 99.722,
              median_depth: 122
            }
          },
          sub_complex: {
            Unknown: {
              percent_coverage: -1,
              median_depth: -1
            }
          },
          species: {
            Mycobacterium_tuberculosis: {
              percent_coverage: 98.199,
              median_depth: 116
            }
          },
          lineage: {
            European_American: {
              percent_coverage: 100.0,
              median_depth: 117
            }
          }
        },
        kmer: 21,
        version: {
          "mykrobe-predictor": "v0.6.5",
          "mykrobe-atlas": "v0.6.5"
        },
        genotype_model: "median_depth"
      }
    }
  },
  MULTIPLE_FIRST_CLASS_RESISTANCE: {
    type: "predictor",
    result: {
      "5b473a285fb3651c8818b32e": {
        susceptibility: {
          Isoniazid: {
            predict: "R"
          },
          Kanamycin: {
            predict: "S"
          },
          Ethambutol: {
            predict: "R"
          },
          Streptomycin: {
            predict: "S"
          },
          Capreomycin: {
            predict: "S"
          },
          Quinolones: {
            predict: "S"
          },
          Pyrazinamide: {
            predict: "S"
          },
          Amikacin: {
            predict: "S"
          },
          Rifampicin: {
            predict: "R"
          }
        },
        phylogenetics: {
          phylo_group: {
            Mycobacterium_tuberculosis_complex: {
              percent_coverage: 99.722,
              median_depth: 122
            }
          },
          sub_complex: {
            Unknown: {
              percent_coverage: -1,
              median_depth: -1
            }
          },
          species: {
            Mycobacterium_tuberculosis: {
              percent_coverage: 98.199,
              median_depth: 116
            }
          },
          lineage: {
            European_American: {
              percent_coverage: 100.0,
              median_depth: 117
            }
          }
        },
        kmer: 21,
        version: {
          "mykrobe-predictor": "v0.6.5",
          "mykrobe-atlas": "v0.6.5"
        },
        genotype_model: "median_depth"
      }
    }
  },
  SECOND_CLASS_RESISTANCE: {
    type: "predictor",
    result: {
      "5b473a285fb3651c8818b32e": {
        susceptibility: {
          Isoniazid: {
            predict: "S"
          },
          Kanamycin: {
            predict: "S"
          },
          Ethambutol: {
            predict: "S"
          },
          Streptomycin: {
            predict: "S"
          },
          Capreomycin: {
            predict: "S"
          },
          Quinolones: {
            predict: "R"
          },
          Pyrazinamide: {
            predict: "S"
          },
          Amikacin: {
            predict: "R"
          },
          Rifampicin: {
            predict: "S"
          }
        },
        phylogenetics: {
          phylo_group: {
            Mycobacterium_tuberculosis_complex: {
              percent_coverage: 99.722,
              median_depth: 122
            }
          },
          sub_complex: {
            Unknown: {
              percent_coverage: -1,
              median_depth: -1
            }
          },
          species: {
            Mycobacterium_tuberculosis: {
              percent_coverage: 98.199,
              median_depth: 116
            }
          },
          lineage: {
            European_American: {
              percent_coverage: 100.0,
              median_depth: 117
            }
          }
        },
        kmer: 21,
        version: {
          "mykrobe-predictor": "v0.6.5",
          "mykrobe-atlas": "v0.6.5"
        },
        genotype_model: "median_depth"
      }
    }
  },
  MDR_XDR_RESISTANCE: {
    type: "predictor",
    result: {
      "5b473a285fb3651c8818b32e": {
        susceptibility: {
          Isoniazid: {
            predict: "R"
          },
          Kanamycin: {
            predict: "R"
          },
          Ethambutol: {
            predict: "R"
          },
          Streptomycin: {
            predict: "R"
          },
          Capreomycin: {
            predict: "S"
          },
          Quinolones: {
            predict: "R"
          },
          Pyrazinamide: {
            predict: "R"
          },
          Amikacin: {
            predict: "R"
          },
          Rifampicin: {
            predict: "R"
          }
        },
        phylogenetics: {
          phylo_group: {
            Mycobacterium_tuberculosis_complex: {
              percent_coverage: 99.722,
              median_depth: 122
            }
          },
          sub_complex: {
            Unknown: {
              percent_coverage: -1,
              median_depth: -1
            }
          },
          species: {
            Mycobacterium_tuberculosis: {
              percent_coverage: 98.199,
              median_depth: 116
            }
          },
          lineage: {
            European_American: {
              percent_coverage: 100.0,
              median_depth: 117
            }
          }
        },
        kmer: 21,
        version: {
          "mykrobe-predictor": "v0.6.5",
          "mykrobe-atlas": "v0.6.5"
        },
        genotype_model: "median_depth"
      }
    }
  },
  RESISTANCE_ALL: {
    type: "predictor",
    result: {
      "5b473a285fb3651c8818b32e": {
        susceptibility: {
          Isoniazid: {
            predict: "R"
          },
          Kanamycin: {
            predict: "R"
          },
          Ethambutol: {
            predict: "R"
          },
          Streptomycin: {
            predict: "R"
          },
          Capreomycin: {
            predict: "R"
          },
          Quinolones: {
            predict: "R"
          },
          Pyrazinamide: {
            predict: "R"
          },
          Amikacin: {
            predict: "R"
          },
          Rifampicin: {
            predict: "R"
          }
        },
        phylogenetics: {
          phylo_group: {
            Mycobacterium_tuberculosis_complex: {
              percent_coverage: 99.722,
              median_depth: 122
            }
          },
          sub_complex: {
            Unknown: {
              percent_coverage: -1,
              median_depth: -1
            }
          },
          species: {
            Mycobacterium_tuberculosis: {
              percent_coverage: 98.199,
              median_depth: 116
            }
          },
          lineage: {
            European_American: {
              percent_coverage: 100.0,
              median_depth: 117
            }
          }
        },
        kmer: 21,
        version: {
          "mykrobe-predictor": "v0.6.5",
          "mykrobe-atlas": "v0.6.5"
        },
        genotype_model: "median_depth"
      }
    }
  }
};
