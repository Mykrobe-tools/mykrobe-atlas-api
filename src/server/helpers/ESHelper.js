import elasticsearch from 'elasticsearch';
import Promise from 'bluebird';
import Experiment from '../models/experiment.model';

/**
 * A Helper class for elasticsearch operations
 */
const config = require('../../config/env');

const client = new elasticsearch.Client({
  host: config.esCluster,
  log: 'info'
});

class ESHelper {

  // Check if the index exists
  static indexExists() {
    return client.indices.exists({
      index: config.esIndexName,
    });
  }

  // Delete the index if it exists
  static deleteIndexIfExists() {
    return Promise.resolve()
      .then(ESHelper.indexExists)
      .then((exists) => {
        if (exists) {
          return client.indices.delete({
            index: config.esIndexName,
          });
        }
        return null;
      });
  }

  // Create the index
  static createIndex() {
    return client.indices.create({
      index: config.esIndexName,
      body: {
        mappings: {
          experiment: {
            properties: {
              metadata: {
                properties: {
                  countryOfBirth: { type: 'string', index: 'not_analyzed' },
                  countryIsolate: { type: 'string', index: 'not_analyzed' },
                  cityIsolate: { type: 'string', index: 'not_analyzed' },
                  anatomicalOrigin: { type: 'string', index: 'not_analyzed' },
                  smear: { type: 'string', index: 'not_analyzed' },
                  wgsPlatform: { type: 'string', index: 'not_analyzed' },
                  genexpert: { type: 'string', index: 'not_analyzed' },
                  hain: { type: 'string', index: 'not_analyzed' },
                  hainRif: { type: 'string', index: 'not_analyzed' },
                  hainInh: { type: 'string', index: 'not_analyzed' },
                  hainFl: { type: 'string', index: 'not_analyzed' },
                  hainEth: { type: 'string', index: 'not_analyzed' },
                  hainAm: { type: 'string', index: 'not_analyzed' },
                  recentMdrTb: { type: 'string', index: 'not_analyzed' },
                  startProgrammaticContinuationTreatment: { type: 'string', index: 'not_analyzed' },
                  nonStandardTreatment: { type: 'string', index: 'not_analyzed' },
                  sputumSmearConversion: { type: 'string', index: 'not_analyzed' },
                  sputumCultureConversion: { type: 'string', index: 'not_analyzed' },
                  whoOutcomeCategory: { type: 'string', index: 'not_analyzed' }
                }
              }
            }
          }
        }
      }
    });
  }

  // Index one experiment
  static indexExperiment(experiment) {
    return client.index({
      index: config.esIndexName,
      type: 'experiment',
      id: experiment.id,
      body: experiment.toJSON()
    });
  }

  // Delete one experiment
  static deleteExperiment(id) {
    return client.delete({
      index: config.esIndexName,
      type: 'experiment',
      id
    });
  }

  // Update one experiment
  static updateExperiment(experiment) {
    return client.update({
      index: config.esIndexName,
      type: 'experiment',
      id: experiment.id,
      body: {
        doc: experiment.toJSON()
      }
    });
  }

  // Index all experiments
  static indexExperiments() {
    return Experiment.list()
      .then((experiments) => {
        const promises = experiments.map(experiment => ESHelper.indexExperiment(experiment));
        return Promise.all(promises);
      });
  }

  // Search distinct metadata values
  static searchMetadataValues(attribute) {
    return client.search({
      index: config.esIndexName,
      type: 'experiment',
      body: {
        size: 0,
        aggs: {
          values: {
            terms: { field: `metadata.${attribute}` }
          }
        }
      }
    });
  }

  // Search by metadata fields
  static searchByMetadataFields(filters) {
    const filtersArray = [];
    const size = filters.per || config.resultsPerPage;
    const page = filters.page || 1;
    const from = size * (page - 1);

    delete filters.per; // eslint-disable-line no-param-reassign
    delete filters.page; // eslint-disable-line no-param-reassign

    Object.keys(filters).forEach((key) => {
      const json = { };
      json[`metadata.${key}`] = filters[key];
      filtersArray.push({
        match: json
      });
    });

    return client.search({
      index: config.esIndexName,
      type: 'experiment',
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
