import fs from "fs";
import csv from "fast-csv";
import { experiment as experimentJsonSchema } from "mykrobe-atlas-jsonschema";
import SchemaExplorer from "makeandship-api-common/lib/modules/jsonschema/schema-explorer";
import Experiment from "../models/experiment.model";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import PredictorResultParser from "./results/PredictorResultParser";
import { geocode } from "../modules/geo";
import LocationHelper from "./LocationHelper";
import logger from "../modules/winston";

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
   * Get the geo cache
   */
  static getCache() {
    if (!geo.initialised) {
      logger.debug(`Loading geocache from ${process.env.PWD}/geoCache.json`);
      const localGeoCache = JSON.parse(fs.readFileSync(`${process.env.PWD}/geoCache.json`));
      Object.keys(localGeoCache).forEach(key => {
        geo.cache[key] = localGeoCache[key];
      });
      geo.initialised = true;
    }

    return geo.cache;
  }

  /**
   * Save the geo cache
   */
  static saveCache() {
    fs.writeFileSync(`${process.env.PWD}/geoCache.json`, JSON.stringify(geo.cache, null, 2));
  }

  /**
   * Load all files from a given directory
   * @param {*} path
   */
  static async load(directory) {
    const metadataFiles = directory.files.filter(
      d => d.path.startsWith("metadata/") && d.type === "File"
    );

    if (metadataFiles.length === 0) {
      throw new Error("Cannot find metadata files");
    }

    for (const file of metadataFiles) {
      if (file.path.includes(".tsv") || file.path.includes(".csv")) {
        await this.process(file, directory);
      }
    }
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
  static async transform(rows, directory) {
    const experiments = [];

    if (rows) {
      for (let row of rows) {
        const isolateId = row.sample_name;
        const country = row.geo_metadata || row.geography_metadata;
        const results = await this.parseResults(row.predictor, directory);

        const mappedCountry = LocationHelper.parseLocation(country);

        const experiment = Object.assign({ results, isolateId }, mappedCountry);

        experiments.push(experiment);
      }
    }

    return experiments;
  }

  /**
   * Extract a central list of geo data from experiments
   * @param {Array} experiments
   * @return {Array} unique city and country
   */
  static getCitiesAndCountries(experiments) {
    const unique = {};
    if (experiments) {
      experiments.forEach(experiment => {
        const location = {
          cityIsolate: experiment.cityIsolate,
          countryIsolate: experiment.countryIsolate
        };
        const key = JSON.stringify(location);
        unique[key] = key;
      });
    }

    if (unique) {
      const keys = Object.keys(unique);
      keys.forEach(key => {
        unique[key] = JSON.parse(key);
      });
      return unique;
    }

    return null;
  }

  /**
   *
   * @param {*} filepath
   */
  static async enhanceWithGeoData(experiments, citiesAndCountries) {
    const cache = this.getCache();

    for (let experiment of experiments) {
      const location = {
        cityIsolate: experiment.cityIsolate,
        countryIsolate: experiment.countryIsolate
      };

      const cacheKey = JSON.stringify(location);

      if (cache[cacheKey]) {
        const match = cache[cacheKey];

        experiment.latitudeIsolate = match.latitudeIsolate;
        experiment.longitudeIsolate = match.longitudeIsolate;
      } else {
        const geo = await this.getGeocode(experiment);
        if (geo) {
          cache[cacheKey] = {
            cityIsolate: experiment.cityIsolate,
            countryIsolate: experiment.countryIsolate,
            longitudeIsolate: geo.longitude,
            latitudeIsolate: geo.latitude
          };
          experiment.latitudeIsolate = cache[cacheKey].latitudeIsolate;
          experiment.longitudeIsolate = cache[cacheKey].longitudeIsolate;

          this.saveCache();
        }
      }
    }

    return experiments;
  }

  static async getGeocode(experiment) {
    if (experiment) {
      const { countryIsolate, countryIsolateName, cityIsolate } = experiment;

      const address = {
        countryCode: countryIsolate,
        city: cityIsolate
      };

      if (address.countryCode || address.city) {
        try {
          const matches = await geocode(address);

          await this.sleep(1000);
          if (matches && Array.isArray(matches)) {
            const geo = matches.find(match => {
              const bothMatch =
                countryIsolate &&
                cityIsolate &&
                (match.countryCode === countryIsolate || match.country === countryIsolateName) &&
                (match.city === cityIsolate || match.state.includes(cityIsolate));
              const countryOnlyMatch =
                countryIsolate &&
                !cityIsolate &&
                (match.countryCode === countryIsolate || match.country === countryIsolateName);
              return bothMatch || countryOnlyMatch;
            });
            if (typeof geo === "undefined") {
              logger.debug(
                `No match for ${cityIsolate} in ${countryIsolate} - ${matches.length} matches`
              );
              if (matches.length > 0) {
                logger.debug(
                  `Possible match: ${matches[0].city} in ${matches[0].state}, ${matches[0].country}`
                );
              }
            }

            return geo;
          }
        } catch (e) {
          logger.debug(`Exception reading geocode for ${JSON.stringify(address)}`);
        }
      }
    }
    return null;
  }

  static getExperiments(rows) {
    const experiments = [];

    if (rows) {
      rows.forEach(row => {
        const {
          isolateId,
          countryIsolate,
          cityIsolate,
          longitudeIsolate,
          latitudeIsolate,
          results
        } = row;
        const experiment = {
          results,
          metadata: {
            sample: {
              isolateId,
              countryIsolate,
              cityIsolate,
              longitudeIsolate,
              latitudeIsolate
            }
          }
        };

        experiments.push(experiment);
      });
    }

    return experiments;
  }

  /**
   * Process a CSV file
   * Bulk insert chunks of 1000
   * @param {*} file
   */
  static async process(file, directory) {
    const rows = await this.loadDataSet(file);
    logger.debug(`${file.path} has ${rows.length} to process`);
    const structuredRows = await this.transform(rows, directory);

    const citiesAndCountries = this.getCitiesAndCountries(structuredRows);
    const structuredRowsWithGeoData = await this.enhanceWithGeoData(
      structuredRows,
      citiesAndCountries
    );

    const experiments = this.getExperiments(structuredRowsWithGeoData);
    logger.debug(`${file.path} has ${experiments.length} experiments to store`);
    const experimentChunks = this.chunk(experiments, BULK_INSERT_LIMIT);

    for (let experimentChunk of experimentChunks) {
      await Experiment.insertMany(experimentChunk);
      logger.debug(`Stored ${experimentChunk.length} experiments of ${rows.length}`);
    }

    return {
      filepath: file.path,
      count: experiments.length
    };
  }

  /**
   * Parses the results
   * Only predictor results are processed for now
   * @param {*} resultFileName
   */
  static async parseResults(resultFileName, directory) {
    const results = [];

    const resultsFile = directory.files.find(
      d => d.path === `results/${resultFileName}` && d.type === "File"
    );

    if (!resultsFile) {
      return results;
    }

    const content = await resultsFile.buffer();
    const parser = new PredictorResultParser({ result: JSON.parse(content.toString()) });
    results.push(parser.parse());

    return results;
  }
}

export default DataHelper;
