import errors from "errors";
import httpStatus from "http-status";
import mkdirp from "mkdirp-promise";
import Promise from "bluebird";
import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch/";

import Experiment from "../models/experiment.model";
import Metadata from "../models/metadata.model";
import Organisation from "../models/organisation.model";
import Resumable from "../helpers/Resumable";
import DownloadersFactory from "../helpers/DownloadersFactory";

import ArrayJSONTransformer from "../transformers/ArrayJSONTransformer";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import ExperimentsResultJSONTransformer from "../transformers/es/ExperimentsResultJSONTransformer";
import SearchResultsJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/SearchResultsJSONTransformer";
import SearchQueryJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/SearchQueryJSONTransformer";
import ChoicesJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/ChoicesJSONTransformer";

import APIError from "../helpers/APIError";
import { schedule } from "../modules/agenda";
import experimentSchema from "../../schemas/experiment";
import ResultsHelper from "../helpers/ResultsHelper";

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

  try {
    const savedExperiment = await experiment.save();
    await ElasticsearchHelper.indexDocument(
      config,
      savedExperiment,
      "experiment"
    );
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
  // use set - https://github.com/Automattic/mongoose/issues/5378
  const experiment = req.experiment;
  Object.keys(req.body).forEach(key => {
    experiment.set(key, req.body[key]);
  });

  try {
    const savedExperiment = await experiment.save();
    await ElasticsearchHelper.updateDocument(
      config,
      savedExperiment,
      "experiment"
    );
    return res.jsend(savedExperiment);
  } catch (e) {
    return res.jerror(new errors.UpdateExperimentError(e.message));
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
    await ElasticsearchHelper.deleteDocument(
      config,
      experiment.id,
      "experiment"
    );
    return res.jsend("Experiment was successfully deleted.");
  } catch (e) {
    return res.jerror(e);
  }
}

/**
 * Update existing metadata
 * @returns {Experiment}
 */
async function metadata(req, res) {
  // use set - https://github.com/Automattic/mongoose/issues/5378
  const experiment = req.experiment;
  experiment.set("metadata", req.body);

  try {
    const savedExperiment = await experiment.save();
    await ElasticsearchHelper.updateDocument(
      config,
      savedExperiment,
      "experiment"
    );
    return res.jsend(savedExperiment);
  } catch (e) {
    return res.jerror(new errors.UpdateExperimentError(e.message));
  }
}

/**
 * Store result of analysis
 * @param {object} req
 * @param {object} res
 */
async function results(req, res) {
  const experiment = req.experiment;
  const predictorResult = ResultsHelper.parse(req.body);
  const results = experiment.get("results");

  const updatedResults = [];
  if (results) {
    updatedResults.push(...results);
  }
  updatedResults.push(predictorResult);
  experiment.set("results", updatedResults);
  try {
    const savedExperiment = await experiment.save();
    await ElasticsearchHelper.updateDocument(
      config,
      savedExperiment,
      "experiment"
    );
    return res.jsend(savedExperiment);
  } catch (e) {
    return res.jerror(new errors.UpdateExperimentError(e.message));
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
    const path = `${config.express.uploadDir}/experiments/${
      experiment.id
    }/file`;
    try {
      await mkdirp(path);
      const downloader = DownloadersFactory.create(
        `${path}/${req.body.name}`,
        req.body
      );
      downloader.download();
      return res.jsend(`Download started from ${req.body.provider}`);
    } catch (e) {
      return res.jerror(new errors.UploadFileError(e.message));
    }
  }

  // no file provided to upload
  if (!req.file) {
    return res.jerror(new errors.UploadFileError("No files found to upload"));
  }

  // from local file
  return Resumable.setUploadDirectory(
    `${config.express.uploadDir}/experiments/${experiment.id}/file`,
    err => {
      if (err) {
        return res.jerror(new errors.UploadFileError(err.message));
      }
      const postUpload = Resumable.post(req);
      if (postUpload.complete) {
        return Resumable.reassembleChunks(
          experiment.id,
          req.body.resumableFilename,
          async () => {
            await schedule("now", "call analysis api", {
              file: `${config.express.uploadsLocation}/experiments/${
                experiment.id
              }/file/${req.body.resumableFilename}`,
              sample_id: experiment.id,
              attempt: 0
            });
            return res.jsend("File uploaded and reassembled");
          }
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
    const path = `${config.express.uploadDir}/experiments/${
      experiment.id
    }/file`;
    return res.sendFile(`${path}/${experiment.file}`);
  }
  return res.jerror("No file found for this Experiment");
}

function uploadStatus(req, res) {
  const experiment = req.experiment;
  return Resumable.setUploadDirectory(
    `${config.express.uploadDir}/experiments/${experiment.id}/file`,
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
    await ElasticsearchHelper.deleteIndexIfExists(config);
    await ElasticsearchHelper.createIndex(
      config,
      experimentSchema,
      "experiment"
    );
    const experiments = await Experiment.list();
    await ElasticsearchHelper.indexDocuments(config, experiments, "experiment");
    return res.jsend("All Experiments have been indexed.");
  } catch (e) {
    return res.jerror(e.message);
  }
}

/**
 * Search distinct metadata values from ES
 */
async function choices(req, res) {
  try {
    const attribute = req.params.attribute;
    const resp = await ElasticsearchHelper.aggregate(
      config,
      experimentSchema,
      { ...req.query },
      "experiment"
    );
    const choices = new ChoicesJSONTransformer().transform(resp, {});
    return res.jsend(choices);
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
    const resp = await ElasticsearchHelper.search(
      config,
      { ...req.query },
      "experiment"
    );

    // core elastic search structure
    const options = {
      per: req.query.per || config.elasticsearch.resultsPerPage,
      page: req.query.page || 1
    };
    const results = new SearchResultsJSONTransformer().transform(resp, options);

    if (results) {
      // hits
      results.results = new ExperimentsResultJSONTransformer().transform(
        resp,
        {}
      );
      // query
      results.search = new SearchQueryJSONTransformer().transform(
        req.query,
        {}
      );
    }
    return res.jsend(results);
  } catch (e) {
    return res.jerror(new errors.SearchMetadataValuesError(e.message));
  }
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  uploadFile,
  metadata,
  results,
  readFile,
  uploadStatus,
  reindex,
  choices,
  search
};
