import elasticsearch from "elasticsearch";
import Promise from "bluebird";
import Experiment from "../models/experiment.model";

/**
 * A Helper class for elasticsearch operations
 */
const config = require("../../config/env");

const client = new elasticsearch.Client({
  host: config.elasticsearch.esCluster,
  log: "error"
});

class ESHelper {
  // Check if the index exists
  static indexExists() {
    return client.indices.exists({
      index: config.elasticsearch.index
    });
  }

  // Delete the index if it exists
  static deleteIndexIfExists = async () => {
    const exists = await ESHelper.indexExists();
    if (exists) {
      return client.indices.delete({
        index: config.elasticsearch.index
      });
    }
    return null;
  };

  // Create the index
  static createIndex() {
    return client.indices.create({
      index: config.elasticsearch.index,
      body: {
        mappings: {
          experiment: {
            properties: {
              metadata: {
                properties: {
                  countryOfBirth: { type: "keyword", index: true },
                  countryIsolate: { type: "keyword", index: true },
                  cityIsolate: { type: "keyword", index: true },
                  anatomicalOrigin: { type: "keyword", index: true },
                  smear: { type: "keyword", index: true },
                  wgsPlatform: { type: "keyword", index: true },
                  genexpert: { type: "keyword", index: true },
                  hain: { type: "keyword", index: true },
                  hainRif: { type: "keyword", index: true },
                  hainInh: { type: "keyword", index: true },
                  hainFl: { type: "keyword", index: true },
                  hainEth: { type: "keyword", index: true },
                  hainAm: { type: "keyword", index: true },
                  recentMdrTb: { type: "keyword", index: true },
                  startProgrammaticContinuationTreatment: {
                    type: "keyword",
                    index: true
                  },
                  nonStandardTreatment: { type: "keyword", index: true },
                  sputumSmearConversion: { type: "keyword", index: true },
                  sputumCultureConversion: { type: "keyword", index: true },
                  whoOutcomeCategory: { type: "keyword", index: true }
                }
              }
            }
          }
        }
      }
    });
  }

  // Index one experiment
  static async indexExperiment(experiment) {
    const indexed = await client.index({
      index: config.elasticsearch.index,
      type: "experiment",
      id: experiment.id,
      body: experiment.toJSON()
    });

    return indexed;
  }

  // Delete one experiment
  static async deleteExperiment(id) {
    return client.delete({
      index: config.elasticsearch.index,
      type: "experiment",
      id
    });
  }

  // Update one experiment
  static updateExperiment(experiment) {
    return client.update({
      index: config.elasticsearch.index,
      type: "experiment",
      id: experiment.id,
      body: {
        doc: experiment.toJSON()
      }
    });
  }

  // Index all experiments
  static indexExperiments = async () => {
    const experiments = await Experiment.list();
    const promises = experiments.map(experiment =>
      ESHelper.indexExperiment(experiment)
    );
    return Promise.all(promises);
  };

  // Search distinct metadata values
  static searchMetadataValues(attribute) {
    const query = {
      index: config.elasticsearch.index,
      type: "experiment",
      body: {
        size: 0,
        aggs: {
          values: {
            terms: { field: `metadata.${attribute}` }
          }
        }
      }
    };
    return client.search(query);
  }

  // Search by metadata fields
  static searchByMetadataFields(filters) {
    const filtersArray = [];
    const size = filters.per || config.elasticsearch.resultsPerPage;
    const page = filters.page || 1;
    const from = size * (page - 1);

    delete filters.per; // eslint-disable-line no-param-reassign
    delete filters.page; // eslint-disable-line no-param-reassign

    Object.keys(filters).forEach(key => {
      const json = {};
      json[`metadata.${key}`] = filters[key];
      filtersArray.push({
        match: json
      });
    });

    return client.search({
      index: config.elasticsearch.index,
      type: "experiment",
      body: {
        from,
        size,
        query: {
          bool: {
            must: filtersArray
          }
        }
      }
    });
  }
}

export default ESHelper;
