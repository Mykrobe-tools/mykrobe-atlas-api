import fs from "fs";
import csv from "fast-csv";
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
  static async load(directory) {
    logger.debug("DataHelper#load: enter");
    const metadataFiles = directory.files.filter(
      d => d.path.startsWith("metadata/") && d.type === "File"
    );
    logger.debug(
      `DataHelper#load: metadataFiles: ${JSON.stringify(metadataFiles.length, null, 2)}`
    );

    if (metadataFiles.length === 0) {
      throw new Error("Cannot find metadata files");
    }

    for (const file of metadataFiles) {
      if (file.path.includes(".tsv") || file.path.includes(".csv")) {
        await this.process(file, directory);
      }
    }
    logger.debug("DataHelper#load: exit");
  }

  /**
   * Load data set into memory
   * @param {*} filepath
   */
  static loadDataSet(file) {
    if (file) {
      const load = new Promise((resolve, reject) => {
        const stream = file.stream();
        const rows = [];

        csv
          .parseStream(stream, { headers: true, delimiter: "\t" })
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
   * @param {*} rows
   */
  static async buildExperimentObjectsFromCSVRows(rows, directory) {
    const experiments = [];

    if (rows) {
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
        const results = await this.loadAndParsePredictorResults(row.predictor, directory);

        // build an experiment
        const experiment = Object.assign({ results, isolateId, coordinates }, mappedCountry);

        experiments.push(experiment);
      }
    }

    return experiments;
  }

  static async buildMongooseReadyExperimentObjects(rows) {
    logger.debug(`DataHelper#buildMongooseReadyExperimentObjects: enter`);
    const experiments = [];

    if (rows) {
      for (const row of rows) {
        const { isolateId, countryIsolate, cityIsolate, results, coordinates } = row;

        const experiment = new Experiment({
          results,
          metadata: {
            sample: {
              isolateId,
              countryIsolate,
              cityIsolate
            }
          }
        });

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

  /**
   * Process a CSV file
   * Bulk insert chunks of 1000
   * @param {*} file
   */
  static async process(file, directory) {
    logger.debug(`DataHelper#process: enter`);

    const rows = await this.loadDataSet(file);
    logger.debug(`DataHelper#process: rows: ${JSON.stringify(rows, null, 2)}`);
    logger.debug(`${file.path} has ${rows.length} to process`);

    // rows > objects
    const experimentObjects = await this.buildExperimentObjectsFromCSVRows(rows, directory);

    // objects > mongoose records
    const experimentDatabaseReadyObjects = await this.buildMongooseReadyExperimentObjects(
      experimentObjects
    );
    logger.debug(`${file.path} has ${experimentDatabaseReadyObjects.length} experiments to store`);

    // build blocks of experiments to write to the database
    const experimentChunks = this.chunk(experimentDatabaseReadyObjects, BULK_INSERT_LIMIT);

    // write each block
    for (const experimentChunk of experimentChunks) {
      // geo coordinates will be added in ExperimentModel save
      await Experiment.insertMany(experimentChunk);
      logger.debug(`Stored ${experimentChunk.length} experiments of ${rows.length}`);
    }

    return {
      filepath: file.path,
      count: experimentDatabaseReadyObjects.length
    };
  }

  /**
   * Loads and parses the results
   * Only predictor results are processed for now
   * @param {*} resultFileName
   */
  static async loadAndParsePredictorResults(resultFileName, directory) {
    logger.debug(`loadAndParsePredictorResults: enter`);
    const results = [];

    const resultsFile = directory.files.find(
      d => d.path === `results/${resultFileName}` && d.type === "File"
    );
    logger.debug(`loadAndParsePredictorResults: resultsFile: ${JSON.stringify(resultsFile.path)}`);

    if (!resultsFile) {
      return results;
    }

    const content = await resultsFile.buffer(); // returns a promise on the buffered content of the file
    if (content) {
      const rawResults = content.toString();
      if (rawResults) {
        const parser = new PredictorResultParser({ result: JSON.parse(rawResults) });
        const result = parser.parse();
        results.push(result);
      } else {
        logger.debug(`loadAndParsePredictorResults: No results file contents found}`);
      }
    } else {
      logger.debug(`loadAndParsePredictorResults: No results file found}`);
    }

    logger.debug(`loadAndParsePredictorResults: results: ${results}`);
    return results;
  }

  static async readSampleIdFromTrackingApi(experimentId, isolateId) {
    logger.debug(`DataHelper#readSampleIdFromTrackingApi: enter`);
    const trackingService = new TrackingService();
    return await trackingService.getTrackingId(experimentId, isolateId);
  }
}

export default DataHelper;
