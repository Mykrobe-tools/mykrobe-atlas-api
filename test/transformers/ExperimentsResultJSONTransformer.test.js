import ExperimentsResultJSONTransformer from "../../src/server/transformers/es/ExperimentsResultJSONTransformer";

describe("ExperimentsResultJSONTransformer", () => {
  it("should transform data from elasticsearch", async () => {
    const results = {
      took: 0.11783,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 2,
        max_score: 1,
        hits: [
          {
            _index: "atlas",
            _type: "experiment",
            _id: "5b507a43c72d183279bcd097",
            _score: 1,
            _source: {
              metadata: {
                patient: {
                  patientId: "eff2fa6a-9d79-41ab-a307-b620cedf7293",
                  siteId: "a2a910e3-25ef-475c-bdf9-f6fe215d949f",
                  genderAtBirth: "Male",
                  countryOfBirth: "India",
                  age: 43,
                  bmi: 25.3,
                  injectingDrugUse: "No",
                  homeless: "No",
                  imprisoned: "No",
                  smoker: "Yes",
                  diabetic: "Insulin",
                  hivStatus: "Not tested"
                },
                sample: {
                  labId: "d19637ed-e5b4-4ca7-8418-8713646a3359",
                  isolateId: "9c0c00f2-8cb1-4254-bf53-3271f35ce696",
                  collectionDate: "2018-10-19",
                  prospectiveIsolate: "Yes",
                  countryIsolate: "India",
                  cityIsolate: "Mumbai",
                  dateArrived: "2018-09-01",
                  anatomicalOrigin: "Respiratory",
                  smear: "Not known"
                },
                genotyping: {
                  wgsPlatform: "MiSeq",
                  otherGenotypeInformation: "Yes",
                  genexpert: "Not tested",
                  hain: "INH/RIF test",
                  hainRif: "RIF resistant",
                  hainInh: "INH sensitive",
                  hainFl: "Not tested",
                  hainAm: "Not tested",
                  hainEth: "Not tested"
                },
                phenotyping: {
                  phenotypeInformationFirstLineDrugs: "Yes",
                  rifampicin: {
                    susceptibility: "Resistant",
                    method: "Not known"
                  },
                  ethambutol: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  pyrazinamide: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  isoniazid: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  phenotypeInformationOtherDrugs: "No"
                }
              },
              created: "2018-07-19T11:47:17.194Z",
              modified: "2018-07-19T11:47:17.194Z",
              id: "5b507a43c72d183279bcd097"
            }
          },
          {
            _index: "atlas",
            _type: "experiment",
            _id: "5b507a43c72d183279bcd098",
            _score: 1,
            _source: {
              metadata: {
                patient: {
                  patientId: "9bd049c5-7407-4129-a973-17291ccdd2cc",
                  siteId: "ccc4e687-a094-4533-b136-c507fe00a9a8",
                  genderAtBirth: "Female",
                  countryOfBirth: "China",
                  age: 32,
                  bmi: 33.1,
                  injectingDrugUse: "No",
                  homeless: "Yes",
                  imprisoned: "No",
                  smoker: "No",
                  diabetic: "Not known",
                  hivStatus: "Not known"
                },
                sample: {
                  labId: "f134b514-d2ac-460c-808b-9c5fd9cb9859",
                  isolateId: "820a78d6-b5b9-45c4-95d1-9463e6bdb14a",
                  collectionDate: "2018-07-22",
                  prospectiveIsolate: "Yes",
                  countryIsolate: "China",
                  cityIsolate: "Chongqing",
                  dateArrived: "2017-11-05",
                  anatomicalOrigin: "Respiratory",
                  smear: "Not known"
                },
                genotyping: {
                  wgsPlatform: "HiSeq",
                  otherGenotypeInformation: "Yes",
                  genexpert: "Not tested",
                  hain: "INH/RIF test",
                  hainRif: "RIF resistant",
                  hainInh: "INH resistant",
                  hainFl: "Not tested",
                  hainAm: "Not tested",
                  hainEth: "Not tested"
                },
                phenotyping: {
                  phenotypeInformationFirstLineDrugs: "Yes",
                  rifampicin: {
                    susceptibility: "Resistant",
                    method: "Not known"
                  },
                  ethambutol: {
                    susceptibility: "Resistant",
                    method: "Not known"
                  },
                  pyrazinamide: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  isoniazid: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  phenotypeInformationOtherDrugs: "Yes",
                  rifabutin: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  ofloxacin: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  ciprofloxacin: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  levofloxacin: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  gatifloxacin: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  amikacin: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  kanamycin: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  gentamicin: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  streptomycin: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  capreomycin: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  clofazimine: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  pas: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  linezolid: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  ethionamideProthionamide: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  rerizidone: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  amoxicilinClavulanate: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  thioacetazone: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  imipenem: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  meropenem: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  clarythromycin: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  highDoseIsoniazid: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  bedaquiline: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  delamanid: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  prothionamide: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  pretothionamide: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  },
                  pretomanid: {
                    susceptibility: "Sensitive",
                    method: "Not known"
                  }
                }
              },
              results: [],
              created: "2018-07-19T11:47:17.253Z",
              modified: "2018-07-19T11:47:17.253Z",
              id: "5b507a43c72d183279bcd098"
            }
          }
        ]
      }
    };

    const transformed = new ExperimentsResultJSONTransformer().transform(results, {});
    expect(transformed.length).toEqual(2);
    transformed.forEach(result => {
      expect(result).toHaveProperty("metadata");
      expect(result).toHaveProperty("created");
      expect(result).toHaveProperty("modified");
      expect(result).toHaveProperty("relevance");
    });
  });

  it("should transform empty array", async () => {
    const results = {
      took: 0.11783,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 2,
        max_score: 1,
        hits: []
      }
    };
    const transformed = new ExperimentsResultJSONTransformer().transform(results, {});

    expect(transformed.length).toEqual(0);
  });
});
