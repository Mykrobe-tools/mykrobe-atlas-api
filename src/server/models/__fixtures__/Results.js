export default {
  valid: {
    predictor: {
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
            type: "complex",
            result: "Mycobacterium_tuberculosis_complex",
            percentCoverage: 99.631,
            medianDepth: 55
          },
          {
            _id: "5b473a285fb3651c8818b33a",
            type: "sub-complex",
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
            type: "sub-species",
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
      lineages: {
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
            type: "phylo_group",
            result: "Mycobacterium_tuberculosis_complex",
            percentCoverage: 99.655,
            medianDepth: 87
          },
          { type: "sub_complex", result: "Unknown", percentCoverage: -1, medianDepth: -1 },
          {
            type: "species",
            result: "Mycobacterium_tuberculosis",
            percentCoverage: 98.312,
            medianDepth: 82
          },
          { type: "lineage", result: "lineage", lineage: ["lineage4.10"] },
          {
            type: "lineage",
            result: "calls_summary",
            callsSummary: {
              "lineage4.10": {
                good_nodes: 2,
                tree_depth: 2,
                genotypes: { lineage4: 1, "lineage4.10": 1 }
              }
            }
          },
          {
            type: "lineage",
            result: "calls",
            calls: {
              "lineage4.10": {
                lineage4: {
                  T931123C: {
                    variant:
                      "ref-T931123C?var_name=T931123C&num_alts=1&ref=NC_000962.3&enum=0&gene=NA&mut=T931123C",
                    genotype: [0, 0],
                    genotype_likelihoods: [-79.47135461717785, -99999999, -11992.047868481237],
                    info: {
                      coverage: {
                        reference: {
                          percent_coverage: 100,
                          median_depth: 102,
                          min_non_zero_depth: 99,
                          kmer_count: 2053,
                          klen: 21
                        },
                        alternate: {
                          percent_coverage: 0,
                          median_depth: 0,
                          min_non_zero_depth: 0,
                          kmer_count: 0,
                          klen: 21
                        }
                      },
                      expected_depths: [87],
                      contamination_depths: [],
                      filter: [],
                      conf: 11913
                    },
                    _cls: "Call.VariantCall"
                  }
                },
                "lineage4.10": {
                  A1692141C: {
                    variant:
                      "ref-A1692141C?var_name=A1692141C&num_alts=1&ref=NC_000962.3&enum=0&gene=NA&mut=A1692141C",
                    genotype: [0, 0],
                    genotype_likelihoods: [-76.08371946683015, -99999999, -11861.745561178046],
                    info: {
                      coverage: {
                        reference: {
                          percent_coverage: 100,
                          median_depth: 101,
                          min_non_zero_depth: 99,
                          kmer_count: 2022,
                          klen: 21
                        },
                        alternate: {
                          percent_coverage: 0,
                          median_depth: 0,
                          min_non_zero_depth: 0,
                          kmer_count: 0,
                          klen: 21
                        }
                      },
                      expected_depths: [87],
                      contamination_depths: [],
                      filter: [],
                      conf: 11786
                    },
                    _cls: "Call.VariantCall"
                  }
                }
              }
            }
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
        },
        mdr: true,
        xdr: false
      },
      unprocessed: {
        inh: {
          result: {
            "188d779f-44ae-4016-9d6a-e95d7363e688": {
              files: ["/data/experiments/5f9ae00eed62b7001239a6a1/file/INH_monoresistant.fastq.gz"],
              genotype_model: "kmer_count",
              kmer: 21,
              phylogenetics: {
                lineage: {
                  calls: {
                    "lineage4.10": {
                      lineage4: {
                        T931123C: {
                          _cls: "Call.VariantCall",
                          genotype: [0, 0],
                          genotype_likelihoods: [
                            -79.47135461717785,
                            -99999999,
                            -11992.047868481237
                          ],
                          info: {
                            conf: 11913,
                            contamination_depths: [],
                            coverage: {
                              alternate: {
                                klen: 21,
                                kmer_count: 0,
                                median_depth: 0,
                                min_non_zero_depth: 0,
                                percent_coverage: 0.0
                              },
                              reference: {
                                klen: 21,
                                kmer_count: 2053,
                                median_depth: 102,
                                min_non_zero_depth: 99,
                                percent_coverage: 100.0
                              }
                            },
                            expected_depths: [87.0],
                            filter: []
                          },
                          variant:
                            "ref-T931123C?var_name=T931123C&num_alts=1&ref=NC_000962.3&enum=0&gene=NA&mut=T931123C"
                        }
                      },
                      "lineage4.10": {
                        A1692141C: {
                          _cls: "Call.VariantCall",
                          genotype: [0, 0],
                          genotype_likelihoods: [
                            -76.08371946683015,
                            -99999999,
                            -11861.745561178046
                          ],
                          info: {
                            conf: 11786,
                            contamination_depths: [],
                            coverage: {
                              alternate: {
                                klen: 21,
                                kmer_count: 0,
                                median_depth: 0,
                                min_non_zero_depth: 0,
                                percent_coverage: 0.0
                              },
                              reference: {
                                klen: 21,
                                kmer_count: 2022,
                                median_depth: 101,
                                min_non_zero_depth: 99,
                                percent_coverage: 100.0
                              }
                            },
                            expected_depths: [87.0],
                            filter: []
                          },
                          variant:
                            "ref-A1692141C?var_name=A1692141C&num_alts=1&ref=NC_000962.3&enum=0&gene=NA&mut=A1692141C"
                        }
                      }
                    }
                  },
                  calls_summary: {
                    "lineage4.10": {
                      genotypes: {
                        lineage4: 1,
                        "lineage4.10": 1
                      },
                      good_nodes: 2,
                      tree_depth: 2
                    }
                  },
                  lineage: ["lineage4.10"]
                },
                phylo_group: {
                  Mycobacterium_tuberculosis_complex: {
                    median_depth: 87.0,
                    percent_coverage: 99.655
                  }
                },
                species: {
                  Mycobacterium_tuberculosis: {
                    median_depth: 82.0,
                    percent_coverage: 98.312
                  }
                },
                sub_complex: {
                  Unknown: {
                    median_depth: -1,
                    percent_coverage: -1
                  }
                }
              },
              probe_sets: [
                "/opt/venv/lib/python3.6/site-packages/mykrobe/data/tb/tb-species-170421.fasta.gz",
                "/opt/venv/lib/python3.6/site-packages/mykrobe/data/tb/tb-hunt-probe-set-jan-03-2019.fasta.gz",
                "/opt/venv/lib/python3.6/site-packages/mykrobe/data/tb/tb.lineage.20200930.probes.fa.gz"
              ],
              susceptibility: {
                Amikacin: {
                  predict: "S"
                },
                Capreomycin: {
                  predict: "S"
                },
                Ciprofloxacin: {
                  predict: "S"
                },
                Ethambutol: {
                  predict: "S"
                },
                Isoniazid: {
                  called_by: {
                    "katG_S315G-GCT2155167GGT": {
                      _cls: "Call.VariantCall",
                      genotype: [1, 1],
                      genotype_likelihoods: [-7758.351551663837, -99999999, -24.800318056402457],
                      info: {
                        conf: 7734,
                        contamination_depths: [],
                        coverage: {
                          alternate: {
                            klen: 20,
                            kmer_count: 1633,
                            median_depth: 82,
                            min_non_zero_depth: 81,
                            percent_coverage: 100.0
                          },
                          reference: {
                            klen: 21,
                            kmer_count: 14,
                            median_depth: 1,
                            min_non_zero_depth: 1,
                            percent_coverage: 70.0
                          }
                        },
                        expected_depths: [87.0],
                        filter: []
                      },
                      variant: null
                    }
                  },
                  predict: "R"
                },
                Kanamycin: {
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
                  predict: "S"
                },
                Streptomycin: {
                  predict: "S"
                }
              },
              version: {
                "mykrobe-atlas": "v0.9.0",
                "mykrobe-predictor": "v0.9.0"
              }
            }
          },
          type: "predictor"
        }
      }
    },
    distance: {
      type: "distance",
      leafId: "leaf_1208",
      result: {
        type: "distance",
        leafId: "225",
        experiments: [
          { sampleId: "8bc98496-9bf8-4111-a40f-5c99ac28e690", leafId: "leaf_1208", distance: 23 },
          { sampleId: "087efc5c-cffa-41dc-b671-5854861af144", leafId: "leaf_1208", distance: 12 }
        ]
      },
      received: "2018-09-10T11:23:20.964Z",
      analysed: "2018-09-10T11:23:20.964Z"
    }
  }
};
