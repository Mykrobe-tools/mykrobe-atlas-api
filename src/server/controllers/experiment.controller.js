import errors from "errors";
import httpStatus from "http-status";
import mkdirp from "mkdirp-promise";
import Promise from "bluebird";

import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch/";
import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";
import SearchResultsJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/SearchResultsJSONTransformer";
import SearchQueryJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/SearchQueryJSONTransformer";
import ChoicesJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/ChoicesJSONTransformer";
import { util as jsonschemaUtil } from "makeandship-api-common/lib/modules/jsonschema";

import Audit from "../models/audit.model";
import Experiment from "../models/experiment.model";
import Organisation from "../models/organisation.model";
import Search from "../models/search.model";
import Tree from "../models/tree.model";

import resumable from "../modules/resumable";
import DownloadersFactory from "../helpers/DownloadersFactory";
import BigsiSearchHelper from "../helpers/BigsiSearchHelper";

import AuditJSONTransformer from "../transformers/AuditJSONTransformer";
import SearchJSONTransformer from "../transformers/SearchJSONTransformer";
import UserJSONTransformer from "../transformers/UserJSONTransformer";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import ExperimentsResultJSONTransformer from "../transformers/es/ExperimentsResultJSONTransformer";
import ResultsJSONTransformer from "../transformers/ResultsJSONTransformer";

import APIError from "../helpers/APIError";
import { schedule } from "../modules/agenda";
import { experiment as experimentSchema } from "mykrobe-atlas-jsonschema";

import ResultsParserFactory from "../helpers/ResultsParserFactory";
import { experimentEventEmitter, userEventEmitter } from "../modules/events";

import {
  isBigsiQuery,
  callBigsiApi,
  parseQuery,
  callTreeApi
} from "../modules/search";

const config = require("../../config/env");

// sort whitelist
const sortWhiteList = ElasticsearchHelper.getSortWhitelist(
  experimentSchema,
  "experiment"
);

/**
 * Load experiment and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const experiment = await Experiment.get(id);
    req.experiment = experiment;

    return next();
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Get experiment
 * @returns {Experiment}
 */
const get = async (req, res) => {
  const experiment = req.experiment.toJSON();
  if (experiment.results && experiment.results.nearestNeighbours) {
    let nearestNeighbours = experiment.results.nearestNeighbours;

    experiment.results.nearestNeighbours = await inflateResult(
      nearestNeighbours
    );
  }

  return res.jsend(experiment);
};

/**
 * Create new experiment
 * @returns {Experiment}
 */
const create = async (req, res) => {
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
};

/**
 * Update existing experiment
 * @returns {Experiment}
 */

const update = async (req, res) => {
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
};

/**
 * Get experiments list.
 * @returns {Experiment[]}
 */
const list = async (req, res) => {
  try {
    const experiments = await Experiment.list();
    const transformer = new ArrayJSONTransformer();
    return res.jsend(
      transformer.transform(experiments, {
        transformer: ExperimentJSONTransformer
      })
    );
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Delete experiment.
 * @returns {Experiment}
 */
const remove = async (req, res) => {
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
};

/**
 * Update existing metadata
 * @returns {Experiment}
 */
const metadata = async (req, res) => {
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
};

/**
 * Store result of analysis
 * @param {object} req
 * @param {object} res
 */
const results = async (req, res) => {
  const experiment = req.experiment;
  const parser = await ResultsParserFactory.create(req.body);
  if (!parser) {
    return res.jerror(new errors.UpdateExperimentError("Invalid result type."));
  }
  const result = parser.parse(req.body);
  const results = experiment.get("results");

  const updatedResults = [];
  if (results) {
    updatedResults.push(...results);
  }
  updatedResults.push(result);
  experiment.set("results", updatedResults);
  try {
    const savedExperiment = await experiment.save();

    await ElasticsearchHelper.updateDocument(
      config,
      savedExperiment,
      "experiment"
    );

    const audit = await Audit.getByExperimentId(savedExperiment.id);

    const experimentJSON = new ExperimentJSONTransformer().transform(
      experiment
    );
    const auditJSON = new AuditJSONTransformer().transform(audit);

    experimentEventEmitter.emit("analysis-complete", {
      audit: auditJSON,
      experiment: experimentJSON,
      type: result.type
    });

    return res.jsend(savedExperiment);
  } catch (e) {
    console.log(e);
    return res.jerror(new errors.UpdateExperimentError(e.message));
  }
};

/**
 * Upload sequence file
 * @returns {Experiment}
 */
const uploadFile = async (req, res) => {
  const experiment = req.experiment;

  // from 3rd party provider
  if (req.body.provider && req.body.path) {
    const path = `${config.express.uploadDir}/experiments/${
      experiment.id
    }/file`;
    try {
      await mkdirp(path);
      const downloader = DownloadersFactory.create(`${path}/${req.body.name}`, {
        experiment,
        ...req.body
      });
      downloader.download(async () => {
        await schedule("now", "call analysis api", {
          file: `${config.express.uploadsLocation}/experiments/${
            experiment.id
          }/file/${req.body.name}`,
          sample_id: experiment.id,
          attempt: 0
        });
      });
      // save file attribute
      experiment.file = req.body.name;
      await experiment.save();

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
  try {
    const experimentJson = new ExperimentJSONTransformer().transform(
      req.experiment
    );
    const resumableFilename = req.body.resumableFilename;

    await resumable.setUploadDirectory(
      `${config.express.uploadDir}/experiments/${experiment.id}/file`
    );
    const postUpload = await resumable.post(req);
    if (!postUpload.complete) {
      experimentEventEmitter.emit("upload-progress", {
        experiment: experimentJson,
        status: postUpload
      });
    } else {
      experimentEventEmitter.emit("upload-complete", {
        experiment: experimentJson,
        status: postUpload
      });
      return resumable.reassembleChunks(
        experimentJson.id,
        resumableFilename,
        async () => {
          await schedule("now", "call analysis api", {
            file: `${config.express.uploadsLocation}/experiments/${
              experimentJson.id
            }/file/${resumableFilename}`,
            sample_id: experimentJson.id,
            attempt: 0,
            experiment: experimentJson
          });
          return res.jsend("File uploaded and reassembled");
        }
      );
    }
    return res.jerror(postUpload);
  } catch (err) {
    return res.jerror(new errors.UploadFileError(err.message));
  }
};

/**
 * Sends the files as API response
 */
const readFile = (req, res) => {
  const experiment = req.experiment;
  if (experiment.file) {
    const path = `${config.express.uploadDir}/experiments/${
      experiment.id
    }/file`;
    return res.sendFile(`${path}/${experiment.file}`);
  }
  return res.jerror("No file found for this Experiment");
};

const uploadStatus = async (req, res) => {
  const experiment = req.experiment;
  try {
    await resumable.setUploadDirectory(
      `${config.express.uploadDir}/experiments/${experiment.id}/file`
    );

    const validateGetRequest = resumable.get(req);
    if (validateGetRequest.valid) {
      return res.jsend(validateGetRequest);
    }
    const error = new APIError(
      validateGetRequest.message,
      httpStatus.NO_CONTENT
    );
    return res.jerror(error);
  } catch (err) {
    return res.jerror(new errors.UploadFileError(err.message));
  }
};

/**
 * Reindex all experiments to ES
 */
const reindex = async (req, res) => {
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
};

/**
 * Search distinct metadata values from ES
 */
const choices = async (req, res) => {
  try {
    const query = req.query;

    // add wildcards if not already set
    if (query.q && !query.q.indexOf("*") > -1) {
      query.q = `*${query.q}*`;
    }

    const resp = await ElasticsearchHelper.aggregate(
      config,
      experimentSchema,
      { ...req.query },
      "experiment"
    );
    const titles = jsonschemaUtil.schemaTitles(experimentSchema);
    const choices = new ChoicesJSONTransformer().transform(resp, { titles });
    return res.jsend(choices);
  } catch (e) {
    return res.jerror(new errors.SearchMetadataValuesError(e.message));
  }
};

/**
 * Get experiments list from ES.
 * @returns {Experiment[]}
 */
const search = async (req, res) => {
  try {
    const clone = JSON.parse(JSON.stringify(req.query));

    const container = parseQuery(clone);

    const bigsi = container.bigsi;
    const query = container.query;

    if (bigsi) {
      const search = await BigsiSearchHelper.search(bigsi, query, req.dbUser);
      return res.jsend(search);
    } else {
      const resp = await ElasticsearchHelper.search(
        config,
        { whitelist: sortWhiteList, ...query },
        "experiment"
      );

      // generate the core elastic search structure
      const options = {
        per: query.per || config.elasticsearch.resultsPerPage,
        page: query.page || 1
      };
      const results = new SearchResultsJSONTransformer().transform(
        resp,
        options
      );

      if (results) {
        // augment with hits (project specific transformation)
        results.results = new ExperimentsResultJSONTransformer().transform(
          resp,
          {}
        );
        // augment with the original search query
        results.search = new SearchQueryJSONTransformer().transform(
          req.query,
          {}
        );
      }
      return res.jsend(results);
    }
  } catch (e) {
    return res.jerror(new errors.SearchMetadataValuesError(e.message));
  }
};

/**
 * List experiment results
 * @param {object} req
 * @param {object} res
 */
const listResults = async (req, res) => {
  const experiment = req.experiment;
  const results = experiment.get("results");

  const resp = new ArrayJSONTransformer().transform(results, {
    transformer: ResultsJSONTransformer
  });

  return res.jsend(resp);
};

const inflateResult = async result => {
  const enhancedExperiments = [];
  if (result.experiments && Array.isArray(result.experiments)) {
    const ids = result.experiments.map(experiment => experiment.id);
    const experiments = await Experiment.findByIds(ids);
    result.experiments.forEach(experiment => {
      try {
        const exp = experiments.filter(item => item.id === experiment.id);
        experiment.results = exp[0].get("results");
        experiment.metadata = exp[0].get("metadata");
      } catch (e) {}
      enhancedExperiments.push(experiment);
    });
  }
  const transformedExperiments = new ArrayJSONTransformer().transform(
    enhancedExperiments,
    {
      transformer: ExperimentJSONTransformer
    }
  );
  result.experiments = transformedExperiments;
  return result;
};

/**
 * Retrieve experiments tree
 * @param {object} req
 * @param {object} res
 */
const tree = async (req, res) => {
  let tree = await Tree.get();
  if (tree && !tree.isExpired()) {
    return res.jsend(tree);
  }
  const treeResult = await callTreeApi();
  tree = tree || new Tree();
  const savedTree = await tree.update(treeResult);
  return res.jsend(savedTree);
};

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
  search,
  listResults,
  tree
};
