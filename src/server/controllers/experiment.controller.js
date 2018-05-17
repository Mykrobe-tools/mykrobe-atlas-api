import errors from "errors";
import httpStatus from "http-status";
import mkdirp from "mkdirp-promise";
import Promise from "bluebird";
import Experiment from "../models/experiment.model";
import Metadata from "../models/metadata.model";
import Organisation from "../models/organisation.model";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import ArrayJSONTransformer from "../transformers/ArrayJSONTransformer";
import Resumable from "../helpers/Resumable";
import APIError from "../helpers/APIError";
import DownloadersFactory from "../helpers/DownloadersFactory";
import ESHelper from "../helpers/ESHelper";
import DistinctValuesESTransformer from "../transformers/es/DistinctValuesESTransformer";
import ExperimentsESTransformer from "../transformers/es/ExperimentsESTransformer";

const config = require("../../config/env");

/**
 * Load experiment and append to req.
 */
async function load(req, res, next, id) {
  try {
    const experiment = await Experiment.get(id);
    req.experiment = experiment;
    return next();
  } catch (e) {
    return res.jerror(e);
  }
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
async function create(req, res) {
  const experiment = new Experiment(req.body);
  experiment.owner = req.dbUser;

  if (req.body.organisation) {
    try {
      const organisation = await Organisation.findOrganisationAndUpdate(
        req.body.organisation,
        req.body.organisation
      );
      experiment.organisation = organisation;
      const savedExperiment = await experiment.save();
      await ESHelper.indexExperiment(experiment);
      return res.jsend(savedExperiment);
    } catch (e) {
      return res.jerror(new errors.CreateExperimentError(e.message));
    }
  }
  try {
    const savedExperiment = await experiment.save();
    await ESHelper.indexExperiment(experiment);
    return res.jsend(savedExperiment);
  } catch (e) {
    return res.jerror(new errors.CreateExperimentError(e.message));
  }
}

/**
 * Update existing experiment
 * @returns {Experiment}
 */
async function update(req, res) {
  const experiment = Object.assign(req.experiment, req.body);
  try {
    const savedExperiment = await experiment.save();
    await ESHelper.updateExperiment(experiment);
    return res.jsend(savedExperiment);
  } catch (e) {
    return res.jerror(new errors.CreateExperimentError(e.message));
  }
}

/**
 * Get experiments list.
 * @returns {Experiment[]}
 */
async function list(req, res) {
  try {
    const experiments = await Experiment.list();
    const transformer = new ArrayJSONTransformer(experiments, {
      transformer: ExperimentJSONTransformer
    });
    return res.jsend(transformer.transform());
  } catch (e) {
    return res.jerror(e);
  }
}

/**
 * Delete experiment.
 * @returns {Experiment}
 */
async function remove(req, res) {
  const experiment = req.experiment;
  try {
    await experiment.remove();
    await ESHelper.deleteExperiment(experiment.id);
    return res.jsend("Experiment was successfully deleted.");
  } catch (e) {
    return res.jerror(e);
  }
}

/**
 * Update experiment metadata
 * @returns {Experiment}
 */
async function updateMetadata(req, res) {
  const metadata = new Metadata(req.body);
  const experiment = req.experiment;
  experiment.metadata = metadata;
  try {
    const savedExperiment = await experiment.save();
    await ESHelper.updateExperiment(experiment);
    return res.jsend(savedExperiment);
  } catch (e) {
    return res.jerror(new errors.CreateExperimentError(e.message));
  }
}

/**
 * Upload sequence file
 * @returns {Experiment}
 */
async function uploadFile(req, res) {
  const experiment = req.experiment;

  // from 3rd party provider
  if (req.body.provider && req.body.path) {
    const path = `${config.uploadDir}/experiments/${experiment.id}/file`;
    try {
      await mkdirp(path);
      const downloader = DownloadersFactory.create(
        `${path}/${req.body.name}`,
        req.body
      );
      downloader.download();
      return res.jsend(`Download started from ${req.body.provider}`);
    } catch (e) {
      return res.jerror(new errors.UploadFileError(err.message));
    }
  }

  // no file provided to upload
  if (!req.file) {
    return res.jerror(new errors.UploadFileError("No files found to upload"));
  }

  // from local file
  return Resumable.setUploadDirectory(
    `${config.uploadDir}/experiments/${experiment.id}/file`,
    err => {
      if (err) {
        return res.jerror(new errors.UploadFileError(err.message));
      }
      const postUpload = Resumable.post(req);
      if (postUpload.complete) {
        return Resumable.reassembleChunks(
          experiment.id,
          req.body.resumableFilename,
          () => res.jsend("File uploaded and reassembled")
        );
      }
      return res.jerror(postUpload);
    }
  );
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
  return res.jerror("No file found for this Experiment");
}

function uploadStatus(req, res) {
  const experiment = req.experiment;
  return Resumable.setUploadDirectory(
    `${config.uploadDir}/experiments/${experiment.id}/file`,
    err => {
      if (err) {
        return res.jerror(new errors.UploadFileError(err.message));
      }
      const validateGetRequest = Resumable.get(req);
      if (validateGetRequest.valid) {
        return res.jsend(validateGetRequest);
      }
      const error = new APIError(
        validateGetRequest.message,
        httpStatus.NO_CONTENT
      );
      return res.jerror(error);
    }
  );
}

/**
 * Reindex all experiments to ES
 */
async function reindex(req, res) {
  try {
    await ESHelper.deleteIndexIfExists();
    await ESHelper.createIndex();
    await ESHelper.indexExperiments();
    return res.jsend("All Experiments have been indexed.");
  } catch (e) {
    return res.jerror(err.message);
  }
}

/**
 * Search distinct metadata values from ES
 */
async function metadataDistinctValues(req, res) {
  try {
    const resp = await ESHelper.searchMetadataValues(req.params.attribute);
    const transformer = new DistinctValuesESTransformer(resp);
    return res.jsend(transformer.transform());
  } catch (e) {
    return res.jerror(new errors.SearchMetadataValuesError(e.message));
  }
}

/**
 * Get experiments list from ES.
 * @returns {Experiment[]}
 */
async function search(req, res) {
  try {
    const resp = await ESHelper.searchByMetadataFields(req.query);
    const transformer = new ExperimentsESTransformer(resp, {
      includeSummary: true
    });
    return res.jsend(transformer.transform());
  } catch (e) {
    return res.jerror(new errors.SearchMetadataValuesError(err.message));
  }
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
