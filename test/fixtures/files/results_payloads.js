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
          Ciprofloxacin: {
            predict: "S"
          },
          Moxifloxacin: {
            predict: "S"
          },
          Ofloxacin: {
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
  TRELLO_789: {
    type: "predictor",
    result: {
      SAMEA1015968: {
        susceptibility: {
          Ofloxacin: {
            predict: "S"
          },
          Moxifloxacin: {
            predict: "S"
          },
          Isoniazid: {
            predict: "R",
            called_by: {
              "katG_S315X-GCT2155167GGT": {
                variant: null,
                genotype: [1, 1],
                genotype_likelihoods: [-6997.246088906566, -99999999, -71.64953752644888],
                info: {
                  coverage: {
                    reference: {
                      percent_coverage: 0.0,
                      median_depth: 0,
                      min_non_zero_depth: 0,
                      kmer_count: 0,
                      klen: 21
                    },
                    alternate: {
                      percent_coverage: 100.0,
                      median_depth: 64,
                      min_non_zero_depth: 57,
                      kmer_count: 1234,
                      klen: 20
                    }
                  },
                  expected_depths: [45.0],
                  contamination_depths: [],
                  filter: [],
                  conf: 6926
                },
                _cls: "Call.VariantCall"
              }
            }
          },
          Kanamycin: {
            predict: "R",
            called_by: {
              "eis_G-10A-C2715342T": {
                variant: null,
                genotype: [1, 1],
                genotype_likelihoods: [-4533.905643932095, -99999999, -57.17551831959444],
                info: {
                  coverage: {
                    reference: {
                      percent_coverage: 5.0,
                      median_depth: 0,
                      min_non_zero_depth: 12,
                      kmer_count: 12,
                      klen: 21
                    },
                    alternate: {
                      percent_coverage: 100.0,
                      median_depth: 34,
                      min_non_zero_depth: 33,
                      kmer_count: 684,
                      klen: 21
                    }
                  },
                  expected_depths: [45.0],
                  contamination_depths: [],
                  filter: [],
                  conf: 4477
                },
                _cls: "Call.VariantCall"
              }
            }
          },
          Ethambutol: {
            predict: "r",
            called_by: {
              "embA_C-12T-C4243221T": {
                variant: null,
                genotype: [0, 1],
                genotype_likelihoods: [
                  -2475.5125279500808,
                  -187.41136722471094,
                  -305.8407026902221
                ],
                info: {
                  coverage: {
                    reference: {
                      percent_coverage: 100.0,
                      median_depth: 8,
                      min_non_zero_depth: 7,
                      kmer_count: 167,
                      klen: 21
                    },
                    alternate: {
                      percent_coverage: 100.0,
                      median_depth: 33,
                      min_non_zero_depth: 30,
                      kmer_count: 697,
                      klen: 21
                    }
                  },
                  expected_depths: [45.0],
                  contamination_depths: [],
                  filter: [],
                  conf: 2288
                },
                _cls: "Call.VariantCall"
              },
              "embB_G406A-GGC4247729GCC": {
                variant: null,
                genotype: [0, 1],
                genotype_likelihoods: [
                  -1712.3446587511662,
                  -234.11642316240327,
                  -296.08925388329317
                ],
                info: {
                  coverage: {
                    reference: {
                      percent_coverage: 100.0,
                      median_depth: 5,
                      min_non_zero_depth: 4,
                      kmer_count: 98,
                      klen: 21
                    },
                    alternate: {
                      percent_coverage: 100.0,
                      median_depth: 23,
                      min_non_zero_depth: 22,
                      kmer_count: 440,
                      klen: 20
                    }
                  },
                  expected_depths: [45.0],
                  contamination_depths: [],
                  filter: [],
                  conf: 1478
                },
                _cls: "Call.VariantCall"
              }
            }
          },
          Streptomycin: {
            predict: "R",
            called_by: {
              "rpsL_K43R-AAG781686AGG": {
                variant: null,
                genotype: [1, 1],
                genotype_likelihoods: [-4883.818483337196, -99999999, -58.45871590518201],
                info: {
                  coverage: {
                    reference: {
                      percent_coverage: 0.0,
                      median_depth: 0,
                      min_non_zero_depth: 0,
                      kmer_count: 0,
                      klen: 21
                    },
                    alternate: {
                      percent_coverage: 100.0,
                      median_depth: 38,
                      min_non_zero_depth: 36,
                      kmer_count: 727,
                      klen: 20
                    }
                  },
                  expected_depths: [45.0],
                  contamination_depths: [],
                  filter: [],
                  conf: 4825
                },
                _cls: "Call.VariantCall"
              }
            }
          },
          Ciprofloxacin: {
            predict: "S"
          },
          Pyrazinamide: {
            predict: "r",
            called_by: {
              "pncA_P54Q-CGG2289080CTG": {
                variant: null,
                genotype: [0, 1],
                genotype_likelihoods: [-2602.212772716572, -223.5642477336178, -270.4695389482436],
                info: {
                  coverage: {
                    reference: {
                      percent_coverage: 100.0,
                      median_depth: 8,
                      min_non_zero_depth: 7,
                      kmer_count: 151,
                      klen: 21
                    },
                    alternate: {
                      percent_coverage: 100.0,
                      median_depth: 37,
                      min_non_zero_depth: 36,
                      kmer_count: 714,
                      klen: 20
                    }
                  },
                  expected_depths: [45.0],
                  contamination_depths: [],
                  filter: [],
                  conf: 2379
                },
                _cls: "Call.VariantCall"
              }
            }
          },
          Rifampicin: {
            predict: "R",
            called_by: {
              "rpoB_S450X-TCG761154TTG": {
                variant: null,
                genotype: [1, 1],
                genotype_likelihoods: [-4918.802002162891, -99999999, -56.15992495664833],
                info: {
                  coverage: {
                    reference: {
                      percent_coverage: 0.0,
                      median_depth: 0,
                      min_non_zero_depth: 0,
                      kmer_count: 0,
                      klen: 21
                    },
                    alternate: {
                      percent_coverage: 100.0,
                      median_depth: 40,
                      min_non_zero_depth: 31,
                      kmer_count: 736,
                      klen: 20
                    }
                  },
                  expected_depths: [45.0],
                  contamination_depths: [],
                  filter: [],
                  conf: 4863
                },
                _cls: "Call.VariantCall"
              }
            }
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
              percent_coverage: 99.675,
              median_depth: 45.0
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
              percent_coverage: 98.471,
              median_depth: 43
            }
          },
          lineage: {
            Beijing_East_Asia: {
              percent_coverage: 100.0,
              median_depth: 39
            }
          }
        },
        kmer: 21,
        probe_sets: [
          "/nfs/leia/research/iqbal/software/mykrobe/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-species-170421.fasta.gz",
          "/nfs/leia/research/iqbal/software/mykrobe/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-hunt-probe-set-jan-03-2019.fasta.gz"
        ],
        files: [
          "/nfs/leia/research/iqbal/mhunt/Clockwork_ena_tb/Pipeline_root/00/00/02/54/254/Reads/reads.remove_contam.1.1.fq.gz",
          "/nfs/leia/research/iqbal/mhunt/Clockwork_ena_tb/Pipeline_root/00/00/02/54/254/Reads/reads.remove_contam.1.2.fq.gz"
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
          Ciprofloxacin: {
            predict: "S"
          },
          Moxifloxacin: {
            predict: "S"
          },
          Ofloxacin: {
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
          Ciprofloxacin: {
            predict: "S"
          },
          Moxifloxacin: {
            predict: "S"
          },
          Ofloxacin: {
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
          Ciprofloxacin: {
            predict: "S"
          },
          Moxifloxacin: {
            predict: "S"
          },
          Ofloxacin: {
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
          Ciprofloxacin: {
            predict: "R"
          },
          Moxifloxacin: {
            predict: "S"
          },
          Ofloxacin: {
            predict: "S"
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
          Ciprofloxacin: {
            predict: "R"
          },
          Moxifloxacin: {
            predict: "S"
          },
          Ofloxacin: {
            predict: "S"
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
          Ciprofloxacin: {
            predict: "R"
          },
          Moxifloxacin: {
            predict: "R"
          },
          Ofloxacin: {
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
