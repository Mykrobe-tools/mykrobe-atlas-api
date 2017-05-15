import errors from 'errors';
import httpStatus from 'http-status';
import mkdirp from 'mkdirp-promise';
import Promise from 'bluebird';
import Experiment from '../models/experiment.model';
import Metadata from '../models/metadata.model';
import Organisation from '../models/organisation.model';
import ExperimentJSONTransformer from '../transformers/ExperimentJSONTransformer';
import ArrayJSONTransformer from '../transformers/ArrayJSONTransformer';
import Resumable from '../helpers/Resumable';
import APIError from '../helpers/APIError';
import DownloadersFactory from '../helpers/DownloadersFactory';
import ESHelper from '../helpers/ESHelper';
import DistinctValuesESTransformer from '../transformers/es/DistinctValuesESTransformer';
import ExperimentsESTransformer from '../transformers/es/ExperimentsESTransformer';

const config = require('../../config/env');

/**
 * Load experiment and append to req.
 */
function load(req, res, next, id) {
  Experiment.get(id)
    .then((experiment) => {
      req.experiment = experiment; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => res.jerror(e));
}

/**
 * Get experiment
 * @returns {Experiment}
 */
function get(req, res) {
  return res.jsend(req.experiment);
}

/**
 * Create new experiment
 * @returns {Experiment}
 */
function create(req, res) {
  const experiment = new Experiment(req.body);
  experiment.owner = req.dbUser;

  if (req.body.organisation) {
    return Organisation.findOrganisationAndUpdate(req.body.organisation, req.body.organisation)
      .then((organisation) => {
        experiment.organisation = organisation;
        experiment.save()
          .then(ESHelper.indexExperiment(experiment))
          .then(savedExperiment => res.jsend(savedExperiment))
          .catch(e => res.jerror(new errors.CreateExperimentError(e.message)));
      })
      .catch(e => res.jerror(new errors.CreateExperimentError(e.message)));
  }

  return experiment.save()
    .then(ESHelper.indexExperiment(experiment))
    .then(savedExperiment => res.jsend(savedExperiment))
    .catch(e => res.jerror(new errors.CreateExperimentError(e.message)));
}

/**
 * Update existing experiment
 * @returns {Experiment}
 */
function update(req, res) {
  const experiment = Object.assign(req.experiment, req.body);
  experiment.save()
    .then(ESHelper.updateExperiment(experiment))
    .then(savedExperiment => res.jsend(savedExperiment))
    .catch(e => res.jerror(new errors.CreateExperimentError(e.message)));
}

/**
 * Get experiments list.
 * @returns {Experiment[]}
 */
function list(req, res) {
  Experiment.list()
    .then((experiments) => {
      const transformer = new ArrayJSONTransformer(experiments,
        { transformer: ExperimentJSONTransformer });
      res.jsend(transformer.transform());
    })
    .catch(e => res.jerror(e));
}

/**
 * Delete experiment.
 * @returns {Experiment}
 */
function remove(req, res) {
  const experiment = req.experiment;
  experiment.remove()
    .then(ESHelper.deleteExperiment(experiment.id))
    .then(() => res.jsend('Experiment was successfully deleted.'))
    .catch(e => res.jerror(e));
}

/**
 * Update experiment metadata
 * @returns {Experiment}
 */
function updateMetadata(req, res) {
  const metadata = new Metadata(req.body);
  const experiment = req.experiment;
  experiment.metadata = metadata;
  experiment.save()
    .then(ESHelper.updateExperiment(experiment))
    .then(savedExperiment => res.jsend(savedExperiment))
    .catch(e => res.jerror(new errors.CreateExperimentError(e.message)));
}

/**
 * Upload sequence file
 * @returns {Experiment}
 */
function uploadFile(req, res) {
  const experiment = req.experiment;

  // from 3rd party provider
  if (req.body.provider && req.body.path) {
    const path = `${config.uploadDir}/experiments/${experiment.id}/file`;
    return mkdirp(path)
      .then(() => {
        const downloader = DownloadersFactory.create(`${path}/${req.body.name}`, req.body);
        downloader.download();
        return res.jsend(`Download started from ${req.body.provider}`);
      })
      .catch(err => res.jerror(new errors.UploadFileError(err.message)));
  }

  // no file provided to upload
  if (!req.file) {
    return res.jerror(new errors.UploadFileError('No files found to upload'));
  }

  // from local file
  return Resumable.setUploadDirectory(`${config.uploadDir}/experiments/${experiment.id}/file`, (err) => {
    if (err) {
      return res.jerror(new errors.UploadFileError(err.message));
    }
    const postUpload = Resumable.post(req);
    if (postUpload.complete) {
      return Resumable.reassembleChunks(experiment.id, req.body.resumableFilename, () => res.jsend('File uploaded and reassembled'));
    }
    return res.jerror(postUpload);
  });
}

/**
 * Sends the files as API response
 */
function readFile(req, res) {
  const experiment = req.experiment;
  if (experiment.file) {
    const path = `${config.uploadDir}/experiments/${experiment.id}/file`;
    return res.sendFile(`${path}/${experiment.file}`);
  }
  return res.jerror('No file found for this Experiment');
}

function uploadStatus(req, res) {
  const experiment = req.experiment;
  return Resumable.setUploadDirectory(`${config.uploadDir}/experiments/${experiment.id}/file`, (err) => {
    if (err) {
      return res.jerror(new errors.UploadFileError(err.message));
    }
    const validateGetRequest = Resumable.get(req);
    if (validateGetRequest.valid) {
      return res.jsend(validateGetRequest);
    }
    const error = new APIError(validateGetRequest.message, httpStatus.NO_CONTENT);
    return res.jerror(error);
  });
}

/**
 * Reindex all experiments to ES
 */
function reindex(req, res) {
  Promise.resolve()
    .then(ESHelper.deleteIndexIfExists)
    .then(ESHelper.createIndex)
    .then(ESHelper.indexExperiments)
    .then(() => res.jsend('All Experiments have been indexed.'))
    .catch(err => res.jerror(err.message));
}

/**
 * Search distinct metadata values from ES
 */
function metadataDistinctValues(req, res) {
  ESHelper.searchMetadataValues(req.params.attribute)
    .then((resp) => {
      const transformer = new DistinctValuesESTransformer(resp);
      res.jsend(transformer.transform());
    })
    .catch(err => res.jerror(new errors.SearchMetadataValuesError(err.message)));
}

/**
 * Get experiments list from ES.
 * @returns {Experiment[]}
 */
function search(req, res) {
  ESHelper.searchByMetadataFields(req.query)
    .then((resp) => {
      const transformer = new ExperimentsESTransformer(resp, { includeSummary: true });
      res.jsend(transformer.transform());
    })
    .catch(err => res.jerror(new errors.SearchMetadataValuesError(err.message)));
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  updateMetadata,
  uploadFile,
  readFile,
  uploadStatus,
  reindex,
  metadataDistinctValues,
  search
};
