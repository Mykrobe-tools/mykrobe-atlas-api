export default {
  TRELLO_760: {
    type: "predictor",
    result: {
      "5cd13cb4cb66f1000faea0b3": {
        susceptibility: {
          Isoniazid: {
            predict: "R",
            called_by: {
              "katG_S315X-GCT2155167GGT": {
                variant: null,
                genotype: [1, 1],
                genotype_likelihoods: [-5820.99135631956, -99999999, -82.7661725622509],
                info: {
                  coverage: {
                    reference: {
                      percent_coverage: 0,
                      median_depth: 0,
                      min_non_zero_depth: 0,
                      kmer_count: 0,
                      klen: 21
                    },
                    alternate: {
                      percent_coverage: 100,
                      median_depth: 43,
                      min_non_zero_depth: 40,
                      kmer_count: 850,
                      klen: 20
                    }
                  },
                  expected_depths: [55],
                  contamination_depths: [],
                  filter: [],
                  conf: 5738
                },
                _cls: "Call.VariantCall"
              }
            }
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
          Rifampicin: {
            predict: "R",
            called_by: {
              "rpoB_S450X-TCG761154TTG": {
                variant: null,
                genotype: [1, 1],
                genotype_likelihoods: [-6249.837967310699, -99999999, -55.92699491580406],
                info: {
                  coverage: {
                    reference: {
                      percent_coverage: 0,
                      median_depth: 0,
                      min_non_zero_depth: 0,
                      kmer_count: 0,
                      klen: 21
                    },
                    alternate: {
                      percent_coverage: 100,
                      median_depth: 51,
                      min_non_zero_depth: 48,
                      kmer_count: 960,
                      klen: 20
                    }
                  },
                  expected_depths: [55],
                  contamination_depths: [],
                  filter: [],
                  conf: 6194
                },
                _cls: "Call.VariantCall"
              }
            }
          },
          Amikacin: {
            predict: "S"
          }
        },
        phylogenetics: {
          phylo_group: {
            Mycobacterium_tuberculosis_complex: {
              percent_coverage: 99.631,
              median_depth: 55
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
              percent_coverage: 97.744,
              median_depth: 51
            }
          },
          lineage: {
            European_American: {
              percent_coverage: 100,
              median_depth: 47
            }
          }
        },
        kmer: 21,
        probe_sets: [
          "/usr/local/lib/python3.6/site-packages/mykrobe/data/panels/tb-species-170421.fasta.gz",
          "/usr/local/lib/python3.6/site-packages/mykrobe/data/panels/tb-walker-probe-set-jan-2019.fasta.gz",
          "/usr/local/lib/python3.6/site-packages/mykrobe/data/panels/tb-k21-probe-set-feb-09-2017.fasta.gz"
        ],
        files: ["/data/experiments/5cd13cb4cb66f1000faea0b3/file/MDR.fastq.gz"],
        version: {
          "mykrobe-predictor": "v0.6.1",
          "mykrobe-atlas": "v0.6.1"
        },
        genotype_model: "kmer_count"
      }
    }
  },
  TRELLO_784: {
    type: "predictor",
    result: {
      SAMEA4744311: {
        susceptibility: {
          Ofloxacin: {
            predict: "S"
          },
          Moxifloxacin: {
            predict: "S"
          },
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
          Ciprofloxacin: {
            predict: "S"
          },
          Pyrazinamide: {
            predict: "S"
          },
          Rifampicin: {
            predict: "S"
          },
          Amikacin: {
            predict: "S"
          },
          Capreomycin: {
            predict: "S"
          }
        },
        phylogenetics: {
          phylo_group: {
            Mycobacterium_tuberculosis_complex: {
              percent_coverage: 99.726,
              median_depth: 237.5
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
              percent_coverage: 98.503,
              median_depth: 215.0
            }
          },
          lineage: {
            European_American: {
              percent_coverage: 100.0,
              median_depth: 231
            }
          }
        },
        kmer: 21,
        probe_sets: [
          "/nfs/leia/research/iqbal/software/mykrobe/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-species-170421.fasta.gz",
          "/nfs/leia/research/iqbal/software/mykrobe/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-hunt-probe-set-jan-03-2019.fasta.gz"
        ],
        files: [
          "/nfs/leia/research/iqbal/mhunt/Clockwork_ena_tb/Pipeline_root/00/03/40/73/34073/Reads/reads.remove_contam.1.1.fq.gz",
          "/nfs/leia/research/iqbal/mhunt/Clockwork_ena_tb/Pipeline_root/00/03/40/73/34073/Reads/reads.remove_contam.1.2.fq.gz"
        ],
        version: {
          "mykrobe-predictor": "v0.7.0",
          "mykrobe-atlas": "v0.7.0"
        },
        genotype_model: "kmer_count"
      }
    }
  },
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
