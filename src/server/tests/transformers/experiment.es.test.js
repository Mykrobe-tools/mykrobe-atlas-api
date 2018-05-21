import ExperimentsESTransformer from "../../transformers/es/ExperimentsESTransformer";
import AggregationsESTransformer from "../../transformers/es/AggregationsESTransformer";
import DistinctValuesESTransformer from "../../transformers/es/DistinctValuesESTransformer";
import HitsESTransformer from "../../transformers/es/HitsESTransformer";
import SummaryESTransformer from "../../transformers/es/SummaryESTransformer";

describe("ExperimentsESTransformer", () => {
  it("should transform data from elasticsearch", async () => {
    const results = {
      took: 1,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 5,
        max_score: 1,
        hits: [
          {
            _index: "atlas",
            _type: "experiement",
            _id: "5ae70e76b6d0051480f02edf",
            _score: 1,
            _source: {
              organisation: {
                name: "Apex Entertainment",
                template: "MODS"
              },
              location: {
                name: "London",
                lat: 3.4,
                lng: -2.3
              }
            }
          }
        ]
      }
    };
    const resultsTransformer = new ExperimentsESTransformer(results, {});
    const data = resultsTransformer.transform();

    expect(data.length).toEqual(1);
    expect(data[0].organisation.name).toEqual("Apex Entertainment");
    expect(data[0].organisation.template).toEqual("MODS");
    expect(data[0].location.name).toEqual("London");
    expect(data[0].location.lat).toEqual(3.4);
  });

  it("should transform data with results array", async () => {
    const results = {
      took: 1,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 5,
        max_score: 1,
        hits: {
          results: [
            {
              _index: "incidents",
              _type: "incident",
              _id: "5ae70e76b6d0051480f02edf",
              _score: 1,
              _source: {
                organisation: {
                  name: "Apex Entertainment",
                  template: "MODS"
                },
                location: {
                  name: "London",
                  lat: 3.4,
                  lng: -2.3
                }
              }
            }
          ]
        }
      }
    };
    const resultsTransformer = new ExperimentsESTransformer(results, {});
    const data = resultsTransformer.transform();

    expect(data.results.length).toEqual(1);
    expect(data.results[0].organisation.name).toEqual("Apex Entertainment");
    expect(data.results[0].organisation.template).toEqual("MODS");
    expect(data.results[0].location.name).toEqual("London");
    expect(data.results[0].location.lat).toEqual(3.4);
  });

  it("should transform empty array", async () => {
    const results = {
      took: 1,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 5,
        max_score: 1,
        hits: []
      }
    };
    const resultsTransformer = new ExperimentsESTransformer(results, {});
    const data = resultsTransformer.transform();

    expect(data.length).toEqual(0);
  });

  it("should transform aggregations", async () => {
    const results = {
      took: 1,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 1,
        max_score: 0,
        hits: []
      },
      aggregations: {
        values: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
          buckets: [
            {
              key: "Hong Kong",
              doc_count: 1
            }
          ]
        }
      }
    };
    const aggregationsESTransformer = new AggregationsESTransformer(
      results,
      {}
    );
    const data = aggregationsESTransformer.transform();

    expect(data).toEqual(results.aggregations.values.buckets);
  });

  it("should transform distinct values", async () => {
    const results = {
      took: 1,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 1,
        max_score: 0,
        hits: []
      },
      aggregations: {
        values: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
          buckets: [
            {
              key: "Hong Kong",
              doc_count: 1
            }
          ]
        }
      }
    };
    const distinctValuesESTransformer = new DistinctValuesESTransformer(
      results,
      {}
    );
    const data = distinctValuesESTransformer.transform();

    expect(data.length).toEqual(1);
    expect(data[0]).toEqual("Hong Kong");
  });

  it("should transform hits", async () => {
    const results = {
      took: 1,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 1,
        max_score: 0.5753642,
        hits: [
          {
            _index: "atlas",
            _type: "experiment",
            _id: "5b0297df5e39900bb5196863",
            _score: 0.5753642,
            _source: {
              location: {
                name: "London",
                lat: 3.4,
                lng: -2.3,
                id: "5b0297df5e39900bb5196864"
              },
              organisation: {
                name: "Apex Entertainment",
                template: "MODS",
                id: "5b0297df5e39900bb5196861"
              },
              id: "5b0297df5e39900bb5196863"
            }
          }
        ]
      }
    };
    const hitsTransformer = new HitsESTransformer(results, {});
    const data = hitsTransformer.transform();

    expect(data.summary).toBeUndefined();
    expect(data).toEqual(results.hits.hits);
  });

  it("should transform hits with summary", async () => {
    const results = {
      took: 1,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 1,
        max_score: 0.5753642,
        hits: [
          {
            _index: "atlas",
            _type: "experiment",
            _id: "5b0297df5e39900bb5196863",
            _score: 0.5753642,
            _source: {
              location: {
                name: "London",
                lat: 3.4,
                lng: -2.3,
                id: "5b0297df5e39900bb5196864"
              },
              organisation: {
                name: "Apex Entertainment",
                template: "MODS",
                id: "5b0297df5e39900bb5196861"
              },
              id: "5b0297df5e39900bb5196863"
            }
          }
        ]
      }
    };
    const hitsTransformer = new HitsESTransformer(results, {
      includeSummary: true
    });
    const data = hitsTransformer.transform();

    expect(data.summary).toBeTruthy();
    expect(data).not.toEqual(results.hits.hits);
    expect(data.summary.hits).toEqual(1);
  });

  it("should transform summary", async () => {
    const results = {
      took: 1,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 1,
        max_score: 0.5753642,
        hits: [
          {
            _index: "atlas",
            _type: "experiment",
            _id: "5b0297df5e39900bb5196863",
            _score: 0.5753642,
            _source: {
              location: {
                name: "London",
                lat: 3.4,
                lng: -2.3,
                id: "5b0297df5e39900bb5196864"
              },
              organisation: {
                name: "Apex Entertainment",
                template: "MODS",
                id: "5b0297df5e39900bb5196861"
              },
              id: "5b0297df5e39900bb5196863"
            }
          }
        ]
      }
    };
    const summaryTransformer = new SummaryESTransformer(results);
    const data = summaryTransformer.transform();

    expect(data.hits).toEqual(1);
  });
});
