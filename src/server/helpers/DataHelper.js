import fs from "fs";
import csv from "fast-csv";
import Promise from "bluebird";
import AdmZip from "adm-zip";
import { experiment as experimentJsonSchema } from "mykrobe-atlas-jsonschema";
import SchemaExplorer from "makeandship-api-common/lib/modules/jsonschema/schema-explorer";
import Experiment from "../models/experiment.model";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import PredictorResultParser from "./results/PredictorResultParser";
import logger from "../modules/logger";
import TrackingService from "../modules/tracking/TrackingService";
import LocationHelper from "./LocationHelper";
import ExperimentHelper from "./ExperimentHelper";
import Constants from "../Constants";

const geo = {
  cache: {},
  initialised: false
};

const BULK_INSERT_LIMIT = 1000;

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
  static async load(filepath) {
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

    await this.process(type, metadata, files);
    logger.debug("DataHelper#load: exit");
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
  static async buildExperimentObjectsFromCSVRows(rows, files) {
    const experiments = [];

    if (rows) {
      logger.debug(`DataHelper#buildExperimentObjectsFromCSVRows: ${rows ? rows.length : 0} rows`);
      for (const row of rows) {
        const isolateId = row.sample_name;

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
        const experiment = Object.assign({ results, isolateId, coordinates }, mappedCountry);
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

  static async buildMongooseReadyExperimentObjects(rows) {
    logger.debug(`DataHelper#buildMongooseReadyExperimentObjects: enter`);
    const experiments = [];

    if (rows) {
      for (const row of rows) {
        const { isolateId, countryIsolate, cityIsolate, results, coordinates } = row;

        const existing = isolateId ? await Experiment.findByIsolateIds([isolateId]) : null;
        const exists = existing && Array.isArray(existing) && existing.length;
        logger.debug(
          `DataHelper#buildMongooseReadyExperimentObjects: ${isolateId} exists?: ${exists}`
        );

        const experiment = exists
          ? this.buildExperimentFromCurrent(
              existing[0],
              results,
              isolateId,
              countryIsolate,
              cityIsolate
            )
          : this.buildExperiment(results, isolateId, countryIsolate, cityIsolate);

        logger.debug(`DataHelper#buildMongooseReadyExperimentObjects: generate sampleId`);
        experiment.sampleId =
          Constants.AUTOGENERATE_SAMPLE_ID === "yes"
            ? isolateId
            : await this.readSampleIdFromTrackingApi(experiment.id, isolateId);
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

  static buildExperimentFromCurrent(experiment, results, isolateId, countryIsolate, cityIsolate) {
    logger.debug(`DataHelper#buildExperimentFromCurrent: enter`);
    if (experiment) {
      logger.debug(`DataHelper#buildExperimentFromCurrent: Update existing experiment`);
      experiment.metadata.sample.isolateId = isolateId;
      experiment.metadata.sample.countryIsolate = countryIsolate;
      experiment.metadata.sample.cityIsolate = cityIsolate;

      experiment.set("results", results);

      return experiment;
    } else {
      logger.debug(`DataHelper#buildExperimentFromCurrent: Build experiment`);
      return this.buildExperiment(results, isolateId, countryIsolate, cityIsolate);
    }
  }

  static buildExperiment(results, isolateId, countryIsolate, cityIsolate) {
    logger.debug(`DataHelper#buildExperiment: enter`);
    return new Experiment({
      results,
      metadata: {
        sample: {
          isolateId,
          countryIsolate,
          cityIsolate
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
  static async process(type, metadata, files) {
    logger.debug(`DataHelper#process: enter`);

    const rows = await this.loadMetadata(type, metadata);
    logger.debug(`DataHelper#process: metadata rows: ${JSON.stringify(rows.length, null, 2)}`);

    // rows > objects
    const experimentObjects = await this.buildExperimentObjectsFromCSVRows(rows, files);

    // objects > mongoose records
    const experimentDatabaseReadyObjects = await this.buildMongooseReadyExperimentObjects(
      experimentObjects
    );
    logger.debug(
      `DataHelper#process: ${experimentDatabaseReadyObjects.length} experiments to store`
    );

    // build blocks of experiments to write to the database
    const experimentChunks = this.chunk(experimentDatabaseReadyObjects, BULK_INSERT_LIMIT);

    // write each block
    for (const experimentChunk of experimentChunks) {
      const insertExperiments = experimentChunk.filter(experiment => experiment.isNew);
      const updateExperiments = experimentChunk.filter(experiment => !experiment.isNew);
      // geo coordinates will be added in ExperimentModel save
      logger.debug(`DataHelper#process: Creating ${insertExperiments.length} experiments ...`);
      const insertResult = await Experiment.insertMany(insertExperiments);
      logger.debug(
        `DataHelper#process: Created ${insertExperiments.length} experiments of ${rows.length}`
      );

      const updateResult = { count: 0 };
      logger.debug(
        `DataHelper#process: Updating ${JSON.stringify(updateExperiments.length)} experiments ...`
      );
      for (const updateExperiment of updateExperiments) {
        try {
          const updatedExperiment = await updateExperiment.save();
          updateResult.count++;
        } catch (e) {
          logger.debug(`DataHelper#process: Error: ${e}`);
        }
      }
      logger.debug(
        `DataHelper#process: Updated ${updateResult.count} experiments of ${rows.length}`
      );
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
    return await trackingService.getTrackingId(experimentId, isolateId);
  }
}

export default DataHelper;
