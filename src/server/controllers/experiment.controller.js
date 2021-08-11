import httpStatus from "http-status";
import mkdirp from "mkdirp-promise";
import Promise from "bluebird";
import uuid from "uuid";

import { ValidationError, ErrorUtil, APIError } from "makeandship-api-common/lib/modules/error";
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

import CacheHelper from "../modules/cache/CacheHelper";
import ResponseCache from "../modules/cache/ResponseCache";
import DistanceCache from "../modules/cache/DistanceCache";
import ClusterCache from "../modules/cache/ClusterCache";
import WatchCache from "../modules/cache/WatchCache";

import SearchConfig from "../modules/search/SearchConfig";
import SearchQueryDecorator from "../modules/search/search-query-decorator";
import RequestSearchQueryParser from "../modules/search/request-search-query-parser";

import resumable from "../modules/resumable";
import Scheduler from "../modules/scheduler/Scheduler";
import { experimentEventEmitter, userEventEmitter } from "../modules/events";
import { parseQuery, callTreeApi } from "../modules/search";
import logger from "../modules/logging/logger";
import TrackingService from "../modules/tracking/TrackingService";

import DownloadersFactory from "../helpers/DownloadersFactory";
import BigsiSearchHelper from "../helpers/BigsiSearchHelper";
import ResultsParserFactory from "../helpers/results/ResultsParserFactory";
import EventHelper from "../helpers/events/EventHelper";
import EventProgress from "../helpers/events/EventProgress";
import ExperimentHelper from "../helpers/ExperimentHelper";

import AuditJSONTransformer from "../transformers/AuditJSONTransformer";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import ExperimentSearchJSONTransformer from "../transformers/ExperimentSearchJSONTransformer";
import ExperimentsResultJSONTransformer from "../transformers/es/ExperimentsResultJSONTransformer";
import ResultsJSONTransformer from "../transformers/ResultsJSONTransformer";
import ExperimentJobJSONTransformer from "../transformers/ExperimentJobJSONTransformer";

import config from "../../config/env";
import Constants from "../Constants";
import SearchJSONTransformer from "../transformers/SearchJSONTransformer";

const esConfig = { type: "experiment", ...config.elasticsearch };
const elasticService = new ElasticService(esConfig, experimentSearchSchema);

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
  const id = req.experiment && req.experiment.id ? req.experiment.id : null;
  const query = { id };
  logger.debug(`ExperimentController#get: Generate hash for: ${JSON.stringify(query)}`);
  const hash = CacheHelper.getObjectHash(query);
  logger.debug(`ExperimentController#get: Check #get for: ${JSON.stringify(hash)}`);
  const cached = await ResponseCache.getQueryResponse(`get`, hash);
  logger.debug(`ExperimentController#get: Returned cached response`);
  if (cached && typeof cached !== "undefined") {
    logger.debug(`ExperimentController#get: There is a value in the cache`);
    if (!cached.results || !cached.results.distance || !cached.results.cluster) {
      logger.debug(`ExperimentController#get: No results in the cache`);
      const users = await WatchCache.getUsers(id); // current users watching for distance results
      if (!users) {
        logger.debug(`ExperimentController#get: Requesting distance results`);
        await requestResults(req.experiment, cached.results);
        logger.debug(`ExperimentController#get: End requesting distance results`);
      }
      await WatchCache.setUser(id, req.dbUser); // watch
    }
    logger.debug(`ExperimentController#get: Using cached response`);
    return res.jsend(cached);
  } else {
    logger.debug(`ExperimentController#get: Generate response ...`);
    const experimentJSON = new ExperimentJSONTransformer().transform(req.experiment, {
      calledBy: true
    });

    logger.debug(`ExperimentController#get: Transformed experiment ...`);
    const results = experimentJSON.results || {};
    logger.debug(`ExperimentController#get: Getting distance results from cache ...`);
    const distanceResults = await DistanceCache.getResult(experimentJSON.sampleId);
    logger.debug(`ExperimentController#get: Got distance results from cache ...`);
    logger.debug(`ExperimentController#get: Getting cluster results from cache ...`);
    const clusterResults = await ClusterCache.getResult(experimentJSON.sampleId);
    logger.debug(`ExperimentController#get: Got cluster results from cache ...`);

    if (distanceResults) {
      logger.debug(`ExperimentController#get: Setting distance results ...`);
      results.distance = distanceResults;
    }

    if (clusterResults) {
      logger.debug(`ExperimentController#get: Setting cluster results ...`);
      results.cluster = clusterResults;
    }

    if (!distanceResults || !clusterResults) {
      logger.debug(`ExperimentController#get: distanceResults = ${distanceResults}`);
      logger.debug(`ExperimentController#get: clusterResults = ${clusterResults}`);
      logger.debug(`ExperimentController#get: One result is undefined ...`);
      const users = await WatchCache.getUsers(id); // current users watching for distance results
      logger.debug(`ExperimentController#get: Got current users watching for distance results ...`);
      if (!users) {
        logger.debug(`ExperimentController#get: requesting the distance results ...`);
        await requestResults(experimentJSON, {
          distance: distanceResults,
          cluster: clusterResults
        });
      }
      await WatchCache.setUser(id, req.dbUser); // watch
    }

    logger.debug(`ExperimentController#get: checking if results are defined ...`);
    if (results) {
      logger.debug(`ExperimentController#get: results are defined ...`);
      const promises = {};

      const keys = Object.keys(results);
      keys.forEach(key => {
        const result = results[key];
        promises[key] =
          key === Constants.RESULT_TYPE_CLUSTER
            ? inflateClusterResult(result, Constants.DISTANCE_PROJECTION)
            : inflateResult(result, Constants.DISTANCE_PROJECTION);
      });

      logger.debug(`ExperimentController#get: storing results in experiments ...`);
      experimentJSON.results = await Promise.props(promises);
    }

    if (experimentJSON) {
      logger.debug(`ExperimentController#get: Store response for #get: ${JSON.stringify(hash)}`);
      await ResponseCache.setQueryResponse(`get`, hash, experimentJSON);
    }

    logger.debug(`ExperimentController#get: return experimentJSON ...`);
    return res.jsend(experimentJSON);
  }
};

/**
 * Create new experiment
 * @returns {Experiment}
 */
const create = async (req, res) => {
  const experiment = new Experiment(req.body);
  const trackingService = new TrackingService();
  experiment.owner = req.dbUser;
  experiment.organisation = req.dbUser.organisation;
  if (Constants.AUTOGENERATE_SAMPLE_ID === "yes") {
    experiment.sampleId = uuid.v1();
  } else {
    experiment.sampleId = await trackingService.upsert(experiment.id);
  }

  // init upload state
  await ExperimentHelper.initUploadState(experiment, req.body);

  try {
    const savedExperiment = await experiment.save();
    // prepare and index in search
    const indexableExperiment = new ExperimentSearchJSONTransformer().transform(
      savedExperiment,
      {}
    );
    await elasticService.indexDocument(indexableExperiment);
    return res.jsend(savedExperiment);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.CREATE_EXPERIMENT));
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
    // prepare and index in search
    const indexableExperiment = new ExperimentSearchJSONTransformer().transform(
      savedExperiment,
      {}
    );
    await elasticService.updateDocument(indexableExperiment);
    return res.jsend(savedExperiment);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.UPDATE_EXPERIMENT));
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
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.DELETE_EXPERIMENT));
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
    // prepare and index in search
    const indexableExperiment = new ExperimentSearchJSONTransformer().transform(
      savedExperiment,
      {}
    );
    await elasticService.updateDocument(indexableExperiment);
    return res.jsend(savedExperiment);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.UPDATE_EXPERIMENT));
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
    return res.jerror(
      new APIError(Constants.ERRORS.UPDATE_EXPERIMENT_RESULTS, "Invalid result type")
    );
  }

  logger.debug(
    `ExperimentsController#results: Parsing incoming results: ${JSON.stringify(req.body)}`
  );
  const result = parser.parse(req.body);
  logger.debug(`ExperimentsController#results: Parsed results: ${JSON.stringify(result)}`);

  if (result.type === Constants.RESULT_TYPE_DISTANCE) {
    logger.debug(
      `ExperimentsController#results: Distance leafId: ${JSON.stringify(result.leafId)}`
    );
    experiment.leafId = result.leafId;
    logger.debug(
      `ExperimentsController#results: setting results to the cache for sampleId: ${experiment.sampleId}`
    );
    DistanceCache.setResult(experiment.sampleId, result);
    logger.debug(
      `ExperimentsController#results: saved distance cache for sampleId: ${experiment.sampleId}`
    );
    if (experiment.awaitingFirstDistanceResult) {
      await DistanceCache.deleteResults(result);
      experiment.awaitingFirstDistanceResult = false;
    }
    const users = await WatchCache.getUsers(experiment.id);
    const watchers = users && users.length ? users : [];
    logger.debug(
      `ExperimentsController#results: ${watchers.length} users watching for results of ${experiment.id}`
    );
    logger.debug(`ExperimentsController#results: Distance result added to the cache`);
    experimentEventEmitter.emit(Constants.EVENTS.DISTANCE_SEARCH_COMPLETE.EVENT, {
      experiment: new ExperimentJSONTransformer().transform(experiment),
      users: watchers
    });
    logger.debug(
      `ExperimentsController#results: ${Constants.EVENTS.DISTANCE_SEARCH_COMPLETE.NAME} event sent to the client`
    );
    await WatchCache.delete(experiment.id);
  } else if (result.type === Constants.RESULT_TYPE_CLUSTER) {
    logger.debug(
      `ExperimentsController#results: Cluster sampleId: ${JSON.stringify(experiment.sampleId)}`
    );
    ClusterCache.setResult(experiment.sampleId, result);
    const users = await WatchCache.getUsers(experiment.id);
    const watchers = users && users.length ? users : [];
    logger.debug(
      `ExperimentsController#results: ${watchers.length} users watching for results of ${experiment.id}`
    );
    logger.debug(`ExperimentsController#results: Cluster result added to the cache`);
    experimentEventEmitter.emit(Constants.EVENTS.CLUSTER_SEARCH_COMPLETE.EVENT, {
      experiment: new ExperimentJSONTransformer().transform(experiment),
      users: watchers
    });
    logger.debug(
      `ExperimentsController#results: ${Constants.EVENTS.CLUSTER_SEARCH_COMPLETE.NAME} event sent to the client`
    );
    await WatchCache.delete(experiment.id);
  } else {
    const results = experiment.get("results");

    const updatedResults = [];
    if (results) {
      logger.debug(`ExperimentsController#results: Results already exist`);
      updatedResults.push(...results);
    }

    updatedResults.push(result);
    experiment.set("results", updatedResults);
    logger.debug(`ExperimentsController#results: Result added to results`);
  }

  try {
    logger.debug(`ExperimentsController#results: Saving experiment ...`);
    const savedExperiment = await experiment.save();

    logger.debug(`ExperimentsController#results: Clear experiment get cache ...`);
    const query = { id: savedExperiment.id };
    logger.debug(`ExperimentController#get: Generate hash for: ${JSON.stringify(query)}`);
    const hash = CacheHelper.getObjectHash(query);
    logger.debug(`ExperimentController#get: Clear #get for: ${JSON.stringify(hash)}`);
    const cached = await ResponseCache.deleteQueryResponse(`get`, hash);

    logger.debug(`ExperimentsController#results: Experiment saved`);
    const experimentJSON = new ExperimentJSONTransformer().transform(savedExperiment);

    logger.debug(`ExperimentsController#results: Updating experiment in elasticsearch ...`);
    const indexableExperiment = new ExperimentSearchJSONTransformer().transform(
      savedExperiment,
      {}
    );
    await elasticService.updateDocument(indexableExperiment);
    logger.debug(`ExperimentsController#results: Updated experiment in elasticsearch`);

    const audit = await Audit.getByExperimentId(savedExperiment.id);
    const auditJSON = audit ? new AuditJSONTransformer().transform(audit) : null;

    logger.debug(`ExperimentsController#results: Clear analysis state: ${savedExperiment.id}`);
    await EventHelper.clearAnalysisState(savedExperiment.id);

    logger.debug(`ExperimentsController#results: Emit completeness event ...`);
    experimentEventEmitter.emit("analysis-complete", {
      audit: auditJSON,
      experiment: experimentJSON,
      type: result.type,
      subType: result.subType,
      fileLocation: result.files
    });
    logger.debug(`ExperimentsController#results: Completeness event emitted`);

    return res.jsend(savedExperiment);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.UPDATE_EXPERIMENT_RESULTS));
  }
};

/**
 * Upload sequence file
 * @returns {Experiment}
 */
const uploadFile = async (req, res) => {
  const experiment = req.experiment;
  const experimentJson = new ExperimentJSONTransformer().transform(req.experiment);

  // from 3rd party provider
  if (req.body.provider && req.body.path) {
    const path = `${config.express.uploadDir}/experiments/${experiment.id}/file`;
    const uploadsLocation = `${config.express.uploadsLocation}/experiments/${experiment.id}/file`;

    try {
      // mark download as pending
      await ExperimentHelper.init3rdPartyUploadState(
        experiment,
        `${uploadsLocation}/${req.body.name}`
      );
      await experiment.save();
      const thirdPartyExperimentJson = new ExperimentJobJSONTransformer().transform(experiment);

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
          `${uploadsLocation}/${req.body.name}`
        );
        const scheduler = await Scheduler.getInstance();
        await scheduler.schedule("now", "call analysis api", {
          file: `${uploadsLocation}/${req.body.name}`,
          experiment_id: experiment.id,
          attempt: 0,
          experiment: thirdPartyExperimentJson
        });
      });
      // mark download as complete
      await ExperimentHelper.markFileAsComplete(experiment.id, req.body.name);
      await experiment.save();

      return res.jsend(`Download started from ${req.body.provider}`);
    } catch (e) {
      return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.UPLOAD_FILE));
    }
  }

  // no file provided to upload
  if (!req.file) {
    return res.jerror(new APIError(Constants.ERRORS.UPLOAD_FILE, "No files found to upload"));
  }

  // from local file
  try {
    const resumableFilename = req.body.resumableFilename;

    const uploadDirectory = `${config.express.uploadDir}/experiments/${experiment.id}/file`;
    logger.debug(`ExperimentsController#uploadFile: uploadDirectory: ${uploadDirectory}`);
    await resumable.setUploadDirectory(uploadDirectory);
    const postUpload = await resumable.post(req);
    if (!postUpload.complete) {
      logger.debug(`ExperimentsController#uploadFile: more`);
      const currentProgress = EventProgress.get(postUpload);
      // only update progress for each percent change
      const diff = EventProgress.diff(postUpload.id, postUpload);
      logger.debug(`ExperimentsController#uploadFile: diff: ${JSON.stringify(diff, null, 2)}`);
      if (diff > 1 || !currentProgress) {
        try {
          await EventHelper.updateUploadsState(req.dbUser.id, experiment.id, postUpload);
        } catch (e) {
          logger.error(`Unable to store upload state: ${JSON.stringify(e, null, 2)}`);
        }
        experimentEventEmitter.emit("upload-progress", {
          experiment: experimentJson,
          status: postUpload
        });
        EventProgress.update(postUpload.id, postUpload);
      }
    } else {
      logger.debug(`ExperimentsController#uploadFile: complete`);

      // check pending uploads
      await ExperimentHelper.markFileAsComplete(experiment.id, resumableFilename);
      const pending = await ExperimentHelper.isUploadInProgress(experiment.id);

      await EventHelper.clearUploadsState(req.dbUser.id, experiment.id);
      experimentEventEmitter.emit("upload-complete", {
        experiment: experimentJson,
        status: postUpload
      });
      logger.debug(`ExperimentsController#uploadFile: updateAnalysisState`);
      await EventHelper.updateAnalysisState(
        req.dbUser.id,
        experimentJson.id,
        `${config.express.uploadsLocation}/experiments/${experimentJson.id}/file/${resumableFilename}`
      );
      logger.debug(`ExperimentsController#uploadFile: reassembleChunks ...`);
      return resumable.reassembleChunks(experimentJson.id, resumableFilename, async () => {
        if (!pending) {
          const scheduler = await Scheduler.getInstance();

          // read the experiments data from the db to get the latest files state
          const uploadedExperiment = await Experiment.get(experimentJson.id);
          const uploadedExperimentJson = new ExperimentJobJSONTransformer().transform(
            uploadedExperiment
          );
          await scheduler.schedule("now", "call analysis api", {
            file: `${config.express.uploadsLocation}/experiments/${experimentJson.id}/file/${resumableFilename}`,
            experiment_id: uploadedExperimentJson.id,
            attempt: 0,
            experiment: uploadedExperimentJson
          });
        }
        return res.jsend("File uploaded and reassembled");
      });
    }
    return res.jerror(
      new APIError(Constants.ERRORS.UPLOAD_FILE, "Error uploading file", postUpload)
    );
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.UPLOAD_FILE));
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

  return res.jerror(new APIError(Constants.ERRORS.GET_EXPERIMENT, "Error reading file"));
};

const uploadStatus = async (req, res) => {
  logger.debug(`ExperimentController#uploadStatus: enter`);
  const experiment = req.experiment;
  try {
    const uploadDirectory = `${config.express.uploadDir}/experiments/${experiment.id}/file`;
    logger.debug(`ExperimentController#uploadStatus: uploadDirectory: ${uploadDirectory}`);
    await resumable.setUploadDirectory(uploadDirectory);

    const validateGetRequest = resumable.get(req);
    logger.debug(
      `ExperimentController#uploadStatus: validateGetRequest: ${JSON.stringify(validateGetRequest)}`
    );
    if (validateGetRequest.valid) {
      return res.jsend(validateGetRequest);
    }
    const error = new APIError(
      Constants.ERRORS.UPLOAD_FILE,
      validateGetRequest.message,
      null,
      httpStatus.NO_CONTENT
    );
    return res.jerror(error);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.UPLOAD_FILE));
  }
};

/**
 * Reindex all experiments to ES
 */
const reindex = async (req, res) => {
  try {
    const { indexSizeLimit } = config.elasticsearch;
    const size = req.body.size || req.query.size || indexSizeLimit;
    logger.debug(`ExperimentController#reindex: size: ${size}`);

    const deleteResult = await elasticService.deleteIndex();
    logger.debug(`ExperimentController#reindex: Index deleted: ${JSON.stringify(deleteResult)}`);
    const createResult = await elasticService.createIndex();
    logger.debug(`ExperimentController#reindex: Index created: ${JSON.stringify(createResult)}`);
    // index in batches
    const pagination = {
      count: 0,
      more: true,
      id: null
    };
    while (pagination.more) {
      const data = await Experiment.since(pagination.id, parseInt(size));
      logger.debug(
        `ExperimentController#reindex: Collected data to index: ${data ? data.length : 0}`
      );
      const indexableData = data.map(experiment => {
        const indexableExperiment = new ExperimentSearchJSONTransformer().transform(experiment);
        return indexableExperiment;
      });
      logger.debug(
        `ExperimentController#reindex: Transform data to index: ${
          indexableData ? indexableData.length : 0
        }`
      );
      const result = await elasticService.indexDocuments(indexableData);
      logger.debug(`ExperimentController#reindex: Indexed documents: ${JSON.stringify(result)}`);

      if (data.length === parseInt(size)) {
        pagination.more = true;
        pagination.id = data[data.length - 1]._id;

        logger.debug(`ExperimentController#reindex: More to index from: ${pagination.id}`);
      } else {
        pagination.more = false;
        logger.debug(`ExperimentController#reindex: Indexing complete: ${pagination.id}`);
      }
      pagination.count = pagination.count + data.length;
      logger.debug(`ExperimentController#reindex: Current count: ${pagination.count}`);
    }
    return res.jsend(`All ${pagination.count} experiment(s) have been indexed.`);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.REINDEX_EXPERIMENTS));
  }
};

/**
 * Search distinct metadata values from ES
 */
const choices = async (req, res) => {
  try {
    const clone = Object.assign({}, req.query);
    const container = parseQuery(clone);

    const bigsi = container.bigsi;
    const query = container.query;

    if (bigsi) {
      const cachedSampleIds = await BigsiSearchHelper.getCachedSampleIdsForChoices(
        bigsi,
        query,
        req.dbUser
      );
      if (cachedSampleIds && cachedSampleIds.length) {
        query.sampleId = cachedSampleIds;
      }
    }

    // parse the query
    const parsedQuery = new RequestSearchQueryParser(req.originalUrl).parse(query);
    // apply status and organisation filters
    const searchQuery = new SearchQueryDecorator(req.originalUrl, req.user).decorate(parsedQuery);
    logger.debug(
      `ExperimentsController#choices: searchQuery: ${JSON.stringify(searchQuery, null, 2)}`
    );
    const elasticsearchResults = await elasticService.search(searchQuery, {});

    const titles = jsonschemaUtil.schemaTitles(experimentSearchSchema);
    const choices = await new ChoicesJSONTransformer().transform(elasticsearchResults, { titles });
    return res.jsend(choices);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.SEARCH_METADATA_VALUES));
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

    // generate the core elastic search structure
    const options = {
      per: req.query.per || config.elasticsearch.resultsPerPage,
      page: req.query.page || 1
    };

    if (bigsi) {
      const { search, total } = await BigsiSearchHelper.search(
        bigsi,
        { ...query, ...options },
        req.dbUser
      );

      const searchJson = new SearchJSONTransformer().transform(search, { total, ...options });
      searchJson.search = new SearchQueryJSONTransformer().transform(req.query, {});

      return res.jsend(searchJson);
    } else {
      // parse the query
      const parsedQuery = new RequestSearchQueryParser(req.originalUrl).parse(clone);

      // apply status and organisation filters
      const searchQuery = new SearchQueryDecorator(req.originalUrl, req.user).decorate(parsedQuery);
      logger.debug(
        `ExperimentsController#search: searchQuery: ${JSON.stringify(searchQuery, null, 2)}`
      );
      const elasticsearchResults = await elasticService.search(searchQuery, {});

      const size = await elasticService.count(searchQuery);
      logger.debug(`ExperimentController#search: size: ${size}`);

      const results = new SearchResultsJSONTransformer().transform(elasticsearchResults, options);

      if (results) {
        // augment with hits (project specific transformation)
        results.results = new ExperimentsResultJSONTransformer().transform(elasticsearchResults, {
          currentUser: req.dbUser
        });
        if (results.total === SearchConfig.getMaxPageSize() && size > results.total) {
          logger.debug(`ExperimentsController#search: size > results.`);
          if (results.pagination && results.pagination.per) {
            results.pagination.pages = Math.ceil(size / results.pagination.per);
            logger.debug(
              `ExperimentsController#search: Override pages: ${results.pagination.pages}`
            );
            results.total = size;
            logger.debug(`ExperimentsController#search: Override total: ${results.total}`);
          }
        }
        // augment with the original search query
        results.search = new SearchQueryJSONTransformer().transform(searchQuery, {});
      }
      return res.jsend(results);
    }
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.SEARCH_METADATA_VALUES));
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
    const ids = result.experiments.map(experiment => experiment.sampleId);
    const experiments = await Experiment.findBySampleIds(ids, projection);
    result.experiments.forEach(experiment => {
      try {
        const exp = experiments.find(item => {
          return item.sampleId === experiment.sampleId;
        });
        experiment.results = exp.get("results");
        experiment.metadata = exp.get("metadata");
        experiment.sampleId = exp.sampleId;
        experiment.id = exp.id;
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

const inflateClusterResult = async (result, projection = null) => {
  if (result.nodes && Array.isArray(result.nodes)) {
    const nodes = result.nodes;
    for (const node of nodes) {
      const ids = node.samples;
      const experiments = await Experiment.findBySampleIds(ids, projection);
      const transformedExperiments = new ArrayJSONTransformer().transform(experiments, {
        transformer: ExperimentJSONTransformer
      });
      node.experiments = transformedExperiments;
      delete node.samples;
    }
  }
  return result;
};

const requestResults = async (experiment, cachedResults) => {
  const results = cachedResults || {};
  const scheduler = await Scheduler.getInstance();

  if (!results.distance) {
    logger.debug(
      `ExperimentController#requestResults: Distance results missing, request from Analysis API`
    );
    await scheduler.schedule("now", "call distance api", {
      experiment_id: experiment.id,
      experiment: new ExperimentJobJSONTransformer().transform(experiment)
    });
  }

  if (!results.cluster) {
    logger.debug(
      `ExperimentController#requestResults: Cluster results missing, request from Analysis API`
    );
    await scheduler.schedule("now", "call cluster api", {
      experiment_id: experiment.id,
      experiment: new ExperimentJobJSONTransformer().transform(experiment)
    });
  }
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
  const experimentJson = new ExperimentJobJSONTransformer().transform(experiment);

  const scheduler = await Scheduler.getInstance();
  await scheduler.schedule("now", "call distance api", {
    experiment_id: experiment.id,
    experiment: experimentJson
  });
  await scheduler.schedule("now", "call cluster api", {
    experiment_id: experiment.id,
    experiment: experimentJson
  });
  return res.jsend("Update of existing results triggered");
};

/**
 * Get experiments summary.
 * @returns {Experiment[]}
 */
const summary = async (req, res) => {
  logger.debug(`ExperimentController#summary: enter`);
  try {
    const size = await elasticService.count();
    logger.debug(`ExperimentController#summary: size: ${size}`);

    // if we exceed the max window size, scroll results
    const useScrolling = size > SearchConfig.getMaxPageSize();
    logger.debug(
      `ExperimentController#summary: Scroll: ${size} > ${SearchConfig.getMaxPageSize()} = ${useScrolling}`
    );

    const clone = Object.assign(req.query, {
      per: useScrolling ? SearchConfig.getMaxPageSize() : size,
      source: SearchConfig.getSummaryFields()
    });
    logger.debug(`ExperimentController#plot: Incoming query: ${JSON.stringify(clone, null, 2)}`);

    const hash = CacheHelper.getObjectHash(req.query);
    logger.debug(`ExperimentController#plot: Hash: ${JSON.stringify(hash, null, 2)}`);
    const cached = await ResponseCache.getQueryResponse(`summary`, hash);
    if (cached && typeof cached !== "undefined") {
      logger.debug(`ExperimentController#summary: Using cached summary`);
      return res.jsend(cached);
    } else {
      logger.debug(`ExperimentController#summary: Generating results`);
      // parse the query
      const parsedQuery = new RequestSearchQueryParser(req.originalUrl).parse(clone);

      // prepare the search queru
      const searchQuery = new SearchQueryDecorator(req.originalUrl).decorate(parsedQuery);

      logger.debug(`ExperimentController#summary: Query: ${JSON.stringify(searchQuery, null, 2)}`);

      // call elasticsearch
      const options = {};
      if (useScrolling) {
        options.scroll = SearchConfig.getScrollTTL();
      }
      logger.debug(
        `ExperimentController#summary: Searching with options: ${JSON.stringify(options)}`
      );
      const elasticsearchResults = await elasticService.search(searchQuery, options);

      // augment with full result set if scrolling
      if (useScrolling) {
        const scrollId = elasticsearchResults["_scroll_id"];
        logger.debug(`ExperimentController#summary: Using scrolling: ${scrollId}`);
        const total =
          elasticsearchResults.hits &&
          elasticsearchResults.hits.total &&
          elasticsearchResults.hits.total.value
            ? elasticsearchResults.hits.total.value
            : 0;
        logger.debug(`ExperimentController#summary: Scrolling total results: ${total}`);

        while (
          elasticsearchResults.hits &&
          elasticsearchResults.hits.hits &&
          elasticsearchResults.hits.hits.length < total
        ) {
          const scrollOptions = {
            scroll: Constants.DEFAULT_SCROLL_TTL
          };
          const results = await elasticService.scroll(scrollId, scrollOptions);
          if (results && results.hits && results.hits.hits) {
            logger.debug(
              `ExperimentController#summary: Total ${
                results.hits && results.hits.total ? results.hits.total : 0
              }`
            );
            logger.debug(
              `ExperimentController#summary: More results, adding ${
                results.hits && results.hits.hits ? results.hits.hits.length : 0
              } to overall result set`
            );
            elasticsearchResults.hits.hits.push(...results.hits.hits);
            logger.debug(
              `ExperimentController#summary: Total results: ${elasticsearchResults.hits.hits.length}`
            );
          }
        }
      }

      // transform the results
      const results = new ExperimentsResultJSONTransformer().transform(elasticsearchResults, {});
      if (results) {
        await ResponseCache.setQueryResponse(`summary`, hash, results);
      }
      return res.jsend(results);
    }
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.SEARCH_EXPERIMENTS_SUMMARY));
  }
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
  refreshResults,
  summary
};
