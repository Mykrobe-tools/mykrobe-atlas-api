import errors from "errors";
import httpStatus from "http-status";
import mkdirp from "mkdirp-promise";
import Promise from "bluebird";

import { ElasticService } from "makeandship-api-common/lib/modules/elasticsearch/";
import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";
import SearchResultsJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/SearchResultsJSONTransformer";
import SearchQueryJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/SearchQueryJSONTransformer";
import ChoicesJSONTransformer from "makeandship-api-common/lib/modules/elasticsearch/transformers/ChoicesJSONTransformer";
import { util as jsonschemaUtil } from "makeandship-api-common/lib/modules/jsonschema";

import {
  experiment as experimentSchema,
  experimentSearch as experimentSearchSchema
} from "mykrobe-atlas-jsonschema";

import Audit from "../models/audit.model";
import Experiment from "../models/experiment.model";
import Tree from "../models/tree.model";

import SearchQueryDecorator from "../modules/search/search-query-decorator";
import RequestSearchQueryParser from "../modules/search/request-search-query-parser";

import resumable from "../modules/resumable";
import { schedule } from "../modules/agenda";
import { experimentEventEmitter, userEventEmitter } from "../modules/events";
import { parseQuery, callTreeApi } from "../modules/search";
import winston from "../modules/winston";

import APIError from "../helpers/APIError";
import DownloadersFactory from "../helpers/DownloadersFactory";
import BigsiSearchHelper from "../helpers/BigsiSearchHelper";
import ResultsParserFactory from "../helpers/results/ResultsParserFactory";
import EventHelper from "../helpers/EventHelper";

import AuditJSONTransformer from "../transformers/AuditJSONTransformer";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import ExperimentsResultJSONTransformer from "../transformers/es/ExperimentsResultJSONTransformer";
import ResultsJSONTransformer from "../transformers/ResultsJSONTransformer";

import config from "../../config/env";
import Constants from "../Constants";
import SearchJSONTransformer from "../transformers/SearchJSONTransformer";

const esConfig = { type: "experiment", ...config.elasticsearch };
const elasticService = new ElasticService(esConfig, experimentSearchSchema);

// distance types
const NEAREST_NEIGHBOUR = "nearest-neighbour";
const TREE_DISTANCE = "tree-distance";

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
  const experimentJSON = new ExperimentJSONTransformer().transform(req.experiment, {
    calledBy: true
  });

  const results = experimentJSON.results;
  if (results) {
    const promises = {};

    const keys = Object.keys(results);
    keys.forEach(key => {
      const result = results[key];
      promises[key] = inflateResult(result, Constants.DISTANCE_PROJECTION);
    });

    experimentJSON.results = await Promise.props(promises);
  }

  return res.jsend(experimentJSON);
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
    await elasticService.indexDocument(savedExperiment);
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
    const value = req.body[key];
    experiment.set(key, value);
  });

  try {
    const savedExperiment = await experiment.save();
    await elasticService.updateDocument(savedExperiment);
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
    await elasticService.deleteDocument(experiment.id);
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
    await elasticService.updateDocument(savedExperiment);
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

    await elasticService.updateDocument(savedExperiment);

    const audit = await Audit.getByExperimentId(savedExperiment.id);

    const experimentJSON = new ExperimentJSONTransformer().transform(experiment);
    const auditJSON = audit ? new AuditJSONTransformer().transform(audit) : null;

    await EventHelper.clearAnalysisState(savedExperiment.id);
    experimentEventEmitter.emit("analysis-complete", {
      audit: auditJSON,
      experiment: experimentJSON,
      type: result.type,
      subType: result.subType
    });

    return res.jsend(savedExperiment);
  } catch (e) {
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
    const path = `${config.express.uploadDir}/experiments/${experiment.id}/file`;
    try {
      await mkdirp(path);
      const downloader = DownloadersFactory.create(`${path}/${req.body.name}`, {
        experiment,
        user: req.dbUser,
        ...req.body
      });
      downloader.download(async () => {
        await EventHelper.updateAnalysisState(
          req.dbUser.id,
          experiment.id,
          `${config.express.uploadsLocation}/experiments/${experiment.id}/file/${req.body.name}`
        );
        await schedule("now", "call analysis api", {
          file: `${config.express.uploadsLocation}/experiments/${experiment.id}/file/${req.body.name}`,
          experiment_id: experiment.id,
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
    const experimentJson = new ExperimentJSONTransformer().transform(req.experiment);
    const resumableFilename = req.body.resumableFilename;

    await resumable.setUploadDirectory(
      `${config.express.uploadDir}/experiments/${experiment.id}/file`
    );
    const postUpload = await resumable.post(req);
    if (!postUpload.complete) {
      await EventHelper.updateUploadsState(req.dbUser.id, experiment.id, postUpload);
      experimentEventEmitter.emit("upload-progress", {
        experiment: experimentJson,
        status: postUpload
      });
    } else {
      await EventHelper.clearUploadsState(req.dbUser.id, experiment.id);
      experimentEventEmitter.emit("upload-complete", {
        experiment: experimentJson,
        status: postUpload
      });
      await EventHelper.updateAnalysisState(
        req.dbUser.id,
        experimentJson.id,
        `${config.express.uploadsLocation}/experiments/${experimentJson.id}/file/${resumableFilename}`
      );
      return resumable.reassembleChunks(experimentJson.id, resumableFilename, async () => {
        await schedule("now", "call analysis api", {
          file: `${config.express.uploadsLocation}/experiments/${experimentJson.id}/file/${resumableFilename}`,
          experiment_id: experimentJson.id,
          attempt: 0,
          experiment: experimentJson
        });
        return res.jsend("File uploaded and reassembled");
      });
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
    const path = `${config.express.uploadDir}/experiments/${experiment.id}/file`;
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
    const error = new APIError(validateGetRequest.message, httpStatus.NO_CONTENT);
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
    const { indexSizeLimit } = config.elasticsearch;
    const size = req.body.size || req.query.size || indexSizeLimit;

    await elasticService.deleteIndex();
    await elasticService.createIndex();
    // index in batches
    const pagination = {
      count: 0,
      more: true,
      id: null
    };
    while (pagination.more) {
      const data = await Experiment.since(pagination.id, parseInt(size));
      const result = await elasticService.indexDocuments(data);

      if (data.length === parseInt(size)) {
        pagination.more = true;
        pagination.id = data[data.length - 1]._id;
      } else {
        pagination.more = false;
      }
      pagination.count = pagination.count + data.length;
    }
    return res.jsend(`All ${pagination.count} experiment(s) have been indexed.`);
  } catch (e) {
    return res.jerror(e.message);
  }
};

/**
 * Search distinct metadata values from ES
 */
const choices = async (req, res) => {
  try {
    const clone = Object.assign({}, req.query);
    const container = parseQuery(clone);
    const query = container.query;

    // parse the query
    const parsedQuery = new RequestSearchQueryParser(req.originalUrl).parse(query);

    // apply status and organisation filters
    const searchQuery = new SearchQueryDecorator(req.originalUrl, req.user).decorate(parsedQuery);
    const elasticsearchResults = await elasticService.search(searchQuery, { type: "experiment" });

    const titles = jsonschemaUtil.schemaTitles(experimentSearchSchema);

    const choices = await new ChoicesJSONTransformer().transform(elasticsearchResults, { titles });

    return res.jsend(choices);
  } catch (e) {
    return res.jerror(new errors.SearchMetadataValuesError(e.message));
  }
};

/**
 * Get experiment list.
 * @returns {Experiment[]}
 */
const search = async (req, res) => {
  try {
    const clone = Object.assign({}, req.query);
    const container = parseQuery(clone);

    const bigsi = container.bigsi;
    const query = container.query;

    if (bigsi) {
      const search = await BigsiSearchHelper.search(bigsi, query, req.dbUser);
      const searchJson = new SearchJSONTransformer().transform(search);

      searchJson.search = new SearchQueryJSONTransformer().transform(req.query, {});

      return res.jsend(searchJson);
    } else {
      // parse the query
      const parsedQuery = new RequestSearchQueryParser(req.originalUrl).parse(clone);

      // apply status and organisation filters
      const searchQuery = new SearchQueryDecorator(req.originalUrl, req.user).decorate(parsedQuery);
      const elasticsearchResults = await elasticService.search(searchQuery, { type: "experiment" });

      // generate the core elastic search structure
      const options = {
        per: req.query.per || config.elasticsearch.resultsPerPage,
        page: req.query.page || 1
      };
      const results = new SearchResultsJSONTransformer().transform(elasticsearchResults, options);

      if (results) {
        // augment with hits (project specific transformation)
        results.results = new ExperimentsResultJSONTransformer().transform(
          elasticsearchResults,
          {}
        );
        // augment with the original search query
        results.search = new SearchQueryJSONTransformer().transform(searchQuery, {});
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

const inflateResult = async (result, projection = null) => {
  const enhancedExperiments = [];
  if (result.experiments && Array.isArray(result.experiments)) {
    const ids = result.experiments.map(experiment => experiment.id);
    const experiments = await Experiment.findByIsolateIds(ids, projection);
    result.experiments.forEach(experiment => {
      try {
        const exp = experiments.filter(item => {
          const metadata = item.get("metadata");
          return metadata.sample.isolateId === experiment.id;
        });
        experiment.results = exp[0].get("results");
        experiment.metadata = exp[0].get("metadata");
        experiment.id = exp[0].id;
      } catch (e) {}
      enhancedExperiments.push(experiment);
    });
  }
  const transformedExperiments = new ArrayJSONTransformer().transform(enhancedExperiments, {
    transformer: ExperimentJSONTransformer
  });
  result.experiments = transformedExperiments;
  return result;
};

/**
 * Retrieve experiments tree
 * @param {object} req
 * @param {object} res
 */
const tree = async (req, res) => {
  const current = await Tree.get();

  if (current && !current.isExpired()) {
    return res.jsend(current);
  }

  // no tree (even expired), make one
  const tree = current ? current : new Tree();

  const latest = await callTreeApi();
  const savedTree = await tree.updateAndSetExpiry(latest);

  return res.jsend(savedTree);
};

/**
 * Refresh experiment results
 * @param {object} req
 * @param {object} res
 */
const refreshResults = async (req, res) => {
  const experiment = req.experiment;
  const experimentJson = new ExperimentJSONTransformer().transform(experiment);
  await schedule("now", "call distance api", {
    experiment_id: experiment.id,
    distance_type: NEAREST_NEIGHBOUR,
    experiment: experimentJson
  });
  await schedule("now", "call distance api", {
    experiment_id: experiment.id,
    distance_type: TREE_DISTANCE,
    experiment: experimentJson
  });
  return res.jsend("Update of existing results triggered");
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
  tree,
  refreshResults
};
