import errors from "errors";
import httpStatus from "http-status";
import mkdirp from "mkdirp-promise";
import Promise from "bluebird";
import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch/";
import Experiment from "../models/experiment.model";
import Metadata from "../models/metadata.model";
import Organisation from "../models/organisation.model";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import ArrayJSONTransformer from "../transformers/ArrayJSONTransformer";
import Resumable from "../helpers/Resumable";
import APIError from "../helpers/APIError";
import DownloadersFactory from "../helpers/DownloadersFactory";
import ChoicesESTransformer from "../transformers/es/ChoicesESTransformer";
import ExperimentsESTransformer from "../transformers/es/ExperimentsESTransformer";
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

  if (req.body.organisation) {
    try {
      const organisation = await Organisation.findOrganisationAndUpdate(
        req.body.organisation,
        req.body.organisation
      );
      experiment.organisation = organisation;
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
  const experiment = Object.assign(req.experiment, req.body);
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
 * Update experiment metadata
 * @returns {Experiment}
 */
async function updateMetadata(req, res) {
  const metadata = new Metadata(req.body);
  const experiment = req.experiment;
  experiment.metadata = metadata;
  try {
    await metadata.save();
    const savedExperiment = await experiment.save();
    await ElasticsearchHelper.updateDocument(
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
 * Store result of analysis
 * @param {object} req
 * @param {object} res
 */
async function result(req, res) {
  const experiment = req.experiment;
  const predictorResult = ResultsHelper.parse(req.body);
  experiment.results.push(predictorResult);

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
              file: `${config.express.uploadDir}/experiments/${
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
    const resultsTransformer = new ChoicesESTransformer(resp, {});
    return res.jsend(resultsTransformer.transform());
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
    const transformer = new ExperimentsESTransformer(resp, {
      includeSummary: true
    });
    return res.jsend(transformer.transform());
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
  updateMetadata,
  uploadFile,
  result,
  readFile,
  uploadStatus,
  reindex,
  choices,
  search
};
