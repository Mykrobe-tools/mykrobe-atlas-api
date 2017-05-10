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

}

export default ESHelper;
