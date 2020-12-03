import ExperimentsResultJSONTransformer from "../../../src/server/transformers/es/ExperimentsResultJSONTransformer";
const fixtureElasticsearchResponse = {
  _shards: {
    failed: 0,
    skipped: 0,
    successful: 1,
    total: 1
  },
  hits: {
    hits: [
      {
        _id: "5fb68ebd2790fe001353a52f",
        _index: "mykrobe-dev-experiment",
        _score: 0.0,
        _source: {
          created: "2020-11-19T15:28:54.783Z",
          files: [],
          id: "5fb68ebd2790fe001353a52f",
          leafId: "leaf_1368",
          metadata: {
            sample: {
              cityIsolate: "",
              countryIsolate: "",
              isolateId: "070205737"
            }
          },
          modified: "2020-12-01T11:51:26.212Z",
          results: {
            distance: {
              analysed: "2020-12-01T11:51:26.205Z",
              experiments: [
                {
                  distance: 3,
                  leafId: "leaf_1368",
                  sampleId: "3b55842a-2afa-4b90-b56f-c1a694c58e56"
                }
              ],
              id: "5fc62e3e2b3da10012e45f08",
              leafId: "leaf_1368",
              received: "2020-12-01T11:51:26.205Z",
              type: "distance"
            },
            predictor: {
              externalId: "070205737",
              files: [
                "/nfs/leia/research/iqbal/mhunt/Cryptic_production/Pipeline_root/00/01/52/77/15277/Reads/reads.original.1.1.fq.gz",
                "/nfs/leia/research/iqbal/mhunt/Cryptic_production/Pipeline_root/00/01/52/77/15277/Reads/reads.original.1.2.fq.gz"
              ],
              genotypeModel: "kmer_count",
              id: "5fb68ebd2790fe001353a530",
              kmer: 21,
              mdr: false,
              phylogenetics: {
                lineage: {
                  lineage: ["lineage1.2.1"]
                },
                phylo_group: {
                  Mycobacterium_tuberculosis_complex: {
                    median_depth: 122,
                    percent_coverage: 99.5
                  }
                },
                species: {
                  Mycobacterium_tuberculosis: {
                    median_depth: 115,
                    percent_coverage: 69.917
                  }
                },
                sub_complex: {
                  Unknown: {
                    median_depth: -1,
                    percent_coverage: -1
                  }
                }
              },
              probeSets: [
                "/nfs/leia/research/iqbal/software/Python-3.8.1/lib/python3.8/site-packages/mykrobe/data/tb/tb-species-170421.fasta.gz",
                "/nfs/leia/research/iqbal/software/Python-3.8.1/lib/python3.8/site-packages/mykrobe/data/tb/tb-hunt-probe-set-jan-03-2019.fasta.gz",
                "/nfs/leia/research/iqbal/software/Python-3.8.1/lib/python3.8/site-packages/mykrobe/data/tb/tb.lineage.20200930.probes.fa.gz"
              ],
              r: true,
              received: "2020-11-19T15:26:03.529Z",
              susceptibility: {
                Amikacin: {
                  prediction: "S"
                },
                Capreomycin: {
                  prediction: "S"
                },
                Ciprofloxacin: {
                  prediction: "S"
                },
                Ethambutol: {
                  prediction: "S"
                },
                Isoniazid: {
                  prediction: "S"
                },
                Kanamycin: {
                  prediction: "S"
                },
                Moxifloxacin: {
                  prediction: "S"
                },
                Ofloxacin: {
                  prediction: "S"
                },
                Pyrazinamide: {
                  prediction: "S"
                },
                Rifampicin: {
                  prediction: "R"
                },
                Streptomycin: {
                  prediction: "S"
                }
              },
              tdr: false,
              type: "predictor",
              version: {
                "mykrobe-atlas": "v0.9.0",
                "mykrobe-predictor": "v0.9.0"
              },
              xdr: false
            }
          },
          sampleId: "829c1263-d492-4143-b248-ed668394a7b9"
        },
        _type: "_doc"
      }
    ],
    max_score: 0.0,
    total: {
      relation: "eq",
      value: 33
    }
  },
  timed_out: false,
  took: 652
};

describe("ExperimentsResultJSONTransformer", () => {
  describe("#transform", () => {
    describe("when valid", () => {
      let json = null;
      beforeEach(done => {
        const transformer = new ExperimentsResultJSONTransformer();
        json = transformer.transform(fixtureElasticsearchResponse);
        done();
      });
      it("should return results", done => {
        const first = json[0];
        expect(first).toHaveProperty("created", "2020-11-19T15:28:54.783Z");
        expect(first).toHaveProperty("leafId", "leaf_1368");
        expect(first).toHaveProperty("metadata");
        expect(first).toHaveProperty("modified", "2020-12-01T11:51:26.212Z");
        expect(first).toHaveProperty("results");
        expect(first.results).toHaveProperty("distance");
        expect(first.results).toHaveProperty("predictor");
        expect(first).toHaveProperty("sampleId", "829c1263-d492-4143-b248-ed668394a7b9");

        done();
      });
    });
  });
});
