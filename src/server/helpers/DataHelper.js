import fs from "fs";
import csv from "fast-csv";
import Promise from "bluebird";
import AdmZip from "adm-zip";
import mongoose from "mongoose";
import { experiment as experimentJsonSchema } from "mykrobe-atlas-jsonschema";
import SchemaExplorer from "makeandship-api-common/lib/modules/jsonschema/schema-explorer";
import Experiment from "../models/experiment.model";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import PredictorResultParser from "./results/PredictorResultParser";
import logger from "../modules/logging/logger";
import TrackingService from "../modules/tracking/TrackingService";
import LocationHelper from "./LocationHelper";
import ExperimentHelper from "./ExperimentHelper";
import DateHelper from "./DateHelper";
import Constants from "../Constants";

const geo = {
  cache: {},
  initialised: false
};

const BULK_INSERT_LIMIT = 200;
const BULK_UPDATE_LIMIT = 100;

class DataHelper {
  /**
   * Rate limit support
   * @param {*} ms
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Load all files from a given directory
   * @param {*} path
   */
  static async load(filepath, metadataOnly = false, errors = []) {
    logger.debug("DataHelper#load: enter");

    logger.debug(`DataHelper#load: filepath: ${filepath}`);

    const zip = new AdmZip(filepath);
    logger.debug(`DataHelper#load: zip: ${zip}`);
    const entries = zip.getEntries();
    logger.debug(`DataHelper#load: entries: ${entries.length}`);

    const type = this.getMetadataTypeFromZipEntries(entries);
    logger.debug(`DataHelper#load: type: ${type}`);
    const metadata = this.getMetadataFromZipEntries(entries);
    logger.debug(`DataHelper#load: ${metadata ? "Metadata exists" : "Metadata not found"}`);
    const files = this.getPredictorFilesFromZipEntries(entries);
    logger.debug(
      `DataHelper#load: ${files ? Object.keys(files).length + " file(s) found" : "No files found"}`
    );

    if (metadata == null) {
      throw new Error("Cannot find metadata files");
    }

    await this.process(type, metadata, files, metadataOnly, errors);
    logger.debug("DataHelper#load: exit");

    return errors;
  }

  static getMetadataTypeFromZipEntries(entries) {
    logger.debug(`DataHelper#getMetadataTypeFromZipEntries: enter`);

    for (const entry of entries) {
      const entryName = entry.entryName;

      if (entryName.startsWith("metadata/") && entryName.includes(".tsv")) {
        return "tsv";
      } else if (entryName.startsWith("metadata/") && entryName.includes(".csv")) {
        return "csv";
      }
    }

    return null;
  }

  static getMetadataFromZipEntries(entries) {
    for (const entry of entries) {
      const entryName = entry.entryName;

      if (
        entryName.startsWith("metadata/") &&
        (entryName.includes(".tsv") || entryName.includes(".csv"))
      ) {
        const metadata = entry.getData().toString("utf8");
        return metadata;
      }
    }
    return null;
  }

  static getPredictorFilesFromZipEntries(entries) {
    logger.debug(`DataHelper#getPredictorFilesFromZipEntries: enter`);
    const files = {};

    const re = /^results\/.*?\.json/;
    for (const entry of entries) {
      const entryName = entry.entryName;
      logger.debug(`DataHelper#getPredictorFilesFromZipEntries: entryName: ${entryName}`);
      if (re.test(entryName)) {
        logger.debug(`DataHelper#getPredictorFilesFromZipEntries: valid predictor file`);
        const filename = entryName.split("/").pop();
        const result = JSON.parse(entry.getData().toString("utf8"));

        files[filename] = result;
      }
    }

    return files;
  }

  /**
   * Load data set into memory
   * @param {*} type - csv or tsv
   * @param {*} metadata
   */
  static loadMetadata(type, metadata) {
    logger.debug(`DataHelper#loadMetadata: enter`);
    logger.debug(`DataHelper#loadMetadata: type: ${type}`);

    if (type && metadata) {
      const delimiter = type === "csv" ? "," : "\t";
      const load = new Promise((resolve, reject) => {
        const rows = [];

        csv
          .fromString(metadata, { headers: true, delimiter })
          .on("data", async data => {
            rows.push(data);
          })
          .on("end", () => {
            resolve(rows);
          })
          .on("error", error => {
            reject(error);
          });
      });

      return load;
    }
    return null;
  }

  /**
   * Break up a large array into an array of chunks of a given size
   * @param {*} array
   * @param {*} size
   */
  static chunk(array, size) {
    const chunks = [];
    let index = 0;
    while (index < array.length) {
      chunks.push(array.slice(index, size + index));
      index += size;
    }
    return chunks;
  }

  /**
   * Create experiments from raw rows
   * @param {*} rows - metadata rows
   * @param {*} files - hash of filename => json
   */
  static async buildExperimentObjectsFromCSVRows(rows, files, errors) {
    const experiments = [];

    if (rows) {
      logger.debug(`DataHelper#buildExperimentObjectsFromCSVRows: ${rows ? rows.length : 0} rows`);
      for (const row of rows) {
        DateHelper.validateRow(row, errors);

        const sampleMetadata = {
          isolateId: row.sample_name,
          collectionDate: row.collection_date,
          dateArrived: row.date_arrived
        };

        // city and country
        const country = row.geo_metadata || row.geography_metadata;
        const mappedCountry = LocationHelper.parseLocation(country);

        logger.debug(
          `DataHelper#buildExperimentObjectsFromCSVRows: ${JSON.stringify(mappedCountry, null, 2)}`
        );

        // create a location query - prefer country over countryCode
        const location = {
          city: mappedCountry.cityIsolate
        };
        if (mappedCountry.countryIsolate && mappedCountry.countryIsolateName) {
          location.country = mappedCountry.countryIsolateName;
        } else if (mappedCountry.countryIsolate) {
          location.countryCode = mappedCountry.countryIsolate;
        }

        // geo coordinates
        const coordinates = await LocationHelper.getCoordinates(location);
        logger.debug(
          `DataHelper#buildExperimentObjectsFromCSVRows: coordinates: ${JSON.stringify(
            coordinates,
            null,
            2
          )}`
        );

        // predictor results
        logger.debug(
          `DataHelper#buildExperimentObjectsFromCSVRows: retrieving predictor results: ${JSON.stringify(
            row.predictor
          )}`
        );
        const predictorFilepath = row.predictor;
        logger.debug(
          `DataHelper#buildExperimentObjectsFromCSVRows: predictorFilepath: ${predictorFilepath}`
        );
        const rawResult = files[predictorFilepath];
        const parsedResult = this.parsePredictorResults(rawResult);
        const results = parsedResult ? [parsedResult] : [];

        // build an experiment
        const experiment = Object.assign({ results, sampleMetadata, coordinates }, mappedCountry);
        logger.debug(`DataHelper#buildExperimentObjectsFromCSVRows: Add experiment`);
        experiments.push(experiment);
      }
    }

    logger.debug(
      `DataHelper#buildExperimentObjectsFromCSVRows: ${
        experiments ? experiments.length : 0
      } experiments`
    );
    return experiments;
  }

  static async buildMongooseReadyExperimentObjects(rows, metadataOnly = false) {
    logger.debug(`DataHelper#buildMongooseReadyExperimentObjects: enter`);
    const experiments = [];

    if (rows) {
      for (const row of rows) {
        const { sampleMetadata, countryIsolate, cityIsolate, results, coordinates } = row;

        const existing = sampleMetadata.isolateId
          ? await Experiment.findByIsolateIds([sampleMetadata.isolateId])
          : null;
        const exists = existing && Array.isArray(existing) && existing.length;
        logger.debug(
          `DataHelper#buildMongooseReadyExperimentObjects: ${sampleMetadata.isolateId} exists?: ${exists}`
        );

        // only process existing records when doing metadata only
        if (!exists && metadataOnly) {
          continue;
        }

        const experiment = exists
          ? this.buildExperimentFromCurrent(
              existing[0],
              results,
              sampleMetadata,
              countryIsolate,
              cityIsolate
            )
          : this.buildExperiment(results, sampleMetadata, countryIsolate, cityIsolate);

        logger.debug(`DataHelper#buildMongooseReadyExperimentObjects: generate sampleId`);
        experiment.sampleId =
          Constants.AUTOGENERATE_SAMPLE_ID === "yes"
            ? sampleMetadata.isolateId
            : await this.readSampleIdFromTrackingApi(experiment.id, sampleMetadata.isolateId);
        logger.debug(
          `DataHelper#buildMongooseReadyExperimentObjects: sampleId generated: ${experiment.sampleId}`
        );

        if (coordinates && coordinates.longitude && coordinates.latitude) {
          experiment.metadata.sample.longitudeIsolate = coordinates.longitude;
          experiment.metadata.sample.latitudeIsolate = coordinates.latitude;
        }

        experiments.push(experiment);
      }
    }

    logger.debug(`DataHelper#buildMongooseReadyExperimentObjects: exit`);

    return experiments;
  }

  static buildExperimentFromCurrent(
    experiment,
    results,
    sampleMetadata,
    countryIsolate,
    cityIsolate
  ) {
    logger.debug(`DataHelper#buildExperimentFromCurrent: enter`);
    if (experiment) {
      logger.debug(`DataHelper#buildExperimentFromCurrent: Update existing experiment`);
      experiment.metadata.sample.isolateId =
        sampleMetadata.isolateId || experiment.metadata.sample.isolateId;
      experiment.metadata.sample.collectionDate =
        sampleMetadata.collectionDate || experiment.metadata.sample.collectionDate;
      experiment.metadata.sample.dateArrived =
        sampleMetadata.dateArrived || experiment.metadata.sample.dateArrived;
      experiment.metadata.sample.countryIsolate =
        countryIsolate || experiment.metadata.sample.countryIsolate;
      experiment.metadata.sample.cityIsolate =
        cityIsolate || experiment.metadata.sample.cityIsolate;

      if (results && Array.isArray(results) && results.length > 0) {
        experiment.set("results", results);
      }

      return experiment;
    } else {
      logger.debug(`DataHelper#buildExperimentFromCurrent: Build experiment`);
      return this.buildExperiment(results, sampleMetadata, countryIsolate, cityIsolate);
    }
  }

  static buildExperiment(results, sampleMetadata, countryIsolate, cityIsolate) {
    logger.debug(`DataHelper#buildExperiment: enter`);
    return new Experiment({
      results,
      metadata: {
        sample: {
          countryIsolate,
          cityIsolate,
          ...sampleMetadata
        }
      }
    });
  }

  /**
   * Process a CSV file
   * Bulk insert chunks of 1000
   * @param {*} type - csv or tsv
   * @param {*} metadata
   * @param {*} files as filename => json
   */
  static async process(type, metadata, files, metadataOnly = false, errors) {
    logger.debug(`DataHelper#process: enter`);

    const rows = await this.loadMetadata(type, metadata);
    logger.debug(`DataHelper#process: metadata rows: ${JSON.stringify(rows.length, null, 2)}`);

    // rows > objects
    const experimentObjects = await this.buildExperimentObjectsFromCSVRows(rows, files, errors);

    // objects > mongoose records
    const experimentDatabaseReadyObjects = await this.buildMongooseReadyExperimentObjects(
      experimentObjects,
      metadataOnly
    );
    logger.debug(
      `DataHelper#process: ${experimentDatabaseReadyObjects.length} experiments to store`
    );

    const updateResult = { count: 0 };

    // build blocks of experiments to write to the database
    const experimentChunks = this.chunk(experimentDatabaseReadyObjects, BULK_INSERT_LIMIT);

    // write each block
    for (const experimentChunk of experimentChunks) {
      const insertExperiments = experimentChunk.filter(experiment => experiment.isNew);
      const updateExperiments = experimentChunk.filter(experiment => !experiment.isNew);
      // geo coordinates will be added in ExperimentModel save
      logger.debug(`DataHelper#process: Creating ${insertExperiments.length} experiments ...`);
      const insertResult = await Experiment.insertMany(insertExperiments);
      updateResult.count = updateResult.count + insertExperiments.length;
      logger.debug(
        `DataHelper#process: Created ${insertExperiments.length} experiments of ${rows.length}`
      );

      logger.debug(
        `DataHelper#process: Updating ${JSON.stringify(updateExperiments.length)} experiments ...`
      );
      const updateChunks = this.chunk(updateExperiments, BULK_UPDATE_LIMIT);
      for (const updateChunk of updateChunks) {
        const operations = [];
        for (const updateExperiment of updateChunk) {
          operations.push({
            updateOne: {
              filter: { _id: mongoose.Types.ObjectId(updateExperiment.id) },
              update: { $set: { "metadata.sample": updateExperiment.metadata.sample } }
            }
          });
          // add predictor results if found
          if (updateExperiment.results) {
            const results = updateExperiment.get("results");
            operations.push({
              updateOne: {
                filter: { _id: mongoose.Types.ObjectId(updateExperiment.id) },
                update: { $push: { results: { $each: results } } }
              }
            });
          }
        }
        logger.debug(`DataHelper#process: Updating ${operations.length} experiments ...`);
        logger.debug(`DataHelper#process: Calling bulk write ...`);
        await Experiment.collection.bulkWrite(operations, { orderd: true, w: 1 });
        logger.debug(`DataHelper#process: Bulk write called.`);
        updateResult.count = updateResult.count + operations.length;
        logger.debug(
          `DataHelper#process: Updated ${operations.length} experiments.  ${updateResult.count}/${rows.length} in total.`
        );
      }
    }

    return {
      count: experimentDatabaseReadyObjects.length
    };
  }

  /**
   * Loads and parses the results
   * Only predictor results are processed for now
   * @param {*} result - predictor result json
   */
  static parsePredictorResults(result) {
    logger.debug(`DataHelper#parsePredictorResults: enter`);
    if (result) {
      const parser = new PredictorResultParser({ result });
      const parsedResult = parser.parse();
      return parsedResult;
    } else {
      logger.debug(`DataHelper#parsePredictorResults: No results file contents found`);
    }
  }

  static async readSampleIdFromTrackingApi(experimentId, isolateId) {
    logger.debug(`DataHelper#readSampleIdFromTrackingApi: enter`);
    const trackingService = new TrackingService();
    return await trackingService.upsert(experimentId, isolateId);
  }
}

export default DataHelper;
