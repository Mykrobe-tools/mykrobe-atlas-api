import fs from "fs";
import csv from "fast-csv";
import { experiment as experimentJsonSchema } from "mykrobe-atlas-jsonschema";
import SchemaExplorer from "makeandship-api-common/lib/modules/jsonschema/schema-explorer";
import Experiment from "../models/experiment.model";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";
import { geocode } from "../modules/geo";
import logger from "../modules/winston";

// constants
const explorer = new SchemaExplorer(experimentJsonSchema);
const countryEnum = explorer.getAttributeBy("metadata.sample.countryIsolate", "enum");
const countryEnumNames = explorer.getAttributeBy("metadata.sample.countryIsolate", "enumNames");
const BULK_INSERT_LIMIT = 1000;
const INVALID_COUNTRIES = [];

// countries mapping
const contriesMapping = {
  USA: {
    country: "United States"
  },
  "Cote d'Ivoire": {
    country: "Ivory Coast (Cote D'Ivoire)"
  },
  "Viet Nam": {
    country: "Vietnam"
  },
  Azerbaijan: {
    country: "Azerbaidjan"
  },
  Moldova: {
    country: "Moldavia"
  },
  Russia: {
    country: "Russian Federation"
  },
  Tajikistan: {
    country: "Tadjikistan"
  },
  Korea: {
    country: "South Korea"
  },
  "Canada;Ontario": {
    country: "Canada",
    city: "Ontario"
  },
  "Democratic Republic of the Congo": {
    country: "Congo"
  },
  "Canada;Toronto": {
    country: "Canada",
    city: "Toronto"
  },
  "Beijing, China": {
    country: "China",
    city: "Beijing"
  },
  PERU: {
    country: "Peru"
  },
  UK: {
    country: "United Kingdom"
  },
  "Côte d'Ivoire": {
    country: "Ivory Coast (Cote D'Ivoire)"
  },
  "USA, San Francisco": {
    country: "United States",
    city: "San Francisco"
  },
  "New Guinea": {
    country: "Papua New Guinea"
  },
  Valencia: {
    country: "Spain",
    city: "Valencia"
  },
  Lanzarote: {
    country: "Spain",
    city: "Lanzarote"
  },
  "Gran Canaria": {
    country: "Spain",
    city: "Gran Canaria"
  },
  Tenerife: {
    country: "Spain",
    city: "Tenerife"
  },
  Fuerteventura: {
    country: "Spain",
    city: "Fuerteventura"
  },
  Zaragoza: {
    country: "Spain",
    city: "Zaragoza"
  }
};

class DataHelper {
  /**
   * Rate limit support
   * @param {*} ms
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Load all files from a given path
   * @param {*} path
   */
  static loadDemoData(path) {
    if (!fs.existsSync(path)) {
      throw new Error(`Cannot find ${path} directory`);
    }
    fs.readdir(path, (err, files) => {
      files.forEach(file => this.process(`${path}/${file}`));
    });
  }

  /**
   * Process a CSV file
   * Bulk insert chunks of 1000
   * @param {*} filePath
   */
  static process(filePath) {
    const stream = fs.createReadStream(filePath);
    let buffer = [],
      counter = 0,
      geocodes = [];
    logger.info("Data load started...");
    csv
      .fromStream(stream, { headers: true, delimiter: "\t" })
      .transform(data => transform(data, geocodes))
      .on("data", async data => {
        buffer.push(data);
        counter++;
      })
      .on("end", async () => {
        try {
          if (counter > 0) {
            const chunked = chunk(buffer, BULK_INSERT_LIMIT);
            for (let i = 0; i < chunked.length; i++) {
              const chunk_arr = chunked[i];
              await Experiment.insertMany(chunk_arr);
              logger.info(`Inserting chunk with ${chunk_arr.length} records`);
            }
            logger.info(`All chunks inserted, total of ${buffer.length} records`);
          }
          logger.info("Enhancing experiments with longitude and latitude");
          await enhanceGeoCodes(geocodes);
          logger.info("All records enhanced");
        } catch (e) {
          logger.info(`Error: ${JSON.stringify(e)}`);
          stream.destroy(e);
        }
      });
  }
}

/**
 * Transform the data to a format supported by the schema
 * @param {*} data
 */
const transform = (data, geocodes) => {
  const location = {};
  const geoMetadata = data.geo_metadata;
  if (geoMetadata.indexOf(":") > -1) {
    const geoArray = geoMetadata.split(":");
    location.countryIsolate = geoArray[0].trim();
    location.cityIsolate = geoArray[1].trim();
  } else if (geoMetadata.toLowerCase() === "unknown") {
    location.countryIsolate = "";
    location.cityIsolate = "";
  } else {
    location.countryIsolate = geoMetadata.trim();
    location.cityIsolate = "";
  }
  if (contriesMapping[location.countryIsolate]) {
    location.cityIsolate = contriesMapping[location.countryIsolate].city || location.cityIsolate;
    location.countryIsolate = contriesMapping[location.countryIsolate].country;
  }
  const index = countryEnumNames.indexOf(location.countryIsolate);
  if (countryEnum[index]) {
    if (
      location.cityIsolate &&
      location.cityIsolate !== "" &&
      geocodes.indexOf(`${countryEnum[index]}|${location.cityIsolate}`) === -1
    ) {
      geocodes.push(`${countryEnum[index]}|${location.cityIsolate}`);
    }
    return {
      metadata: {
        sample: {
          isolateId: data.sample_name,
          countryIsolate: countryEnum[index],
          cityIsolate: location.cityIsolate
        }
      }
    };
  }

  if (INVALID_COUNTRIES.indexOf(location.countryIsolate) === -1) {
    logger.info(`Invalid country found: ${location.countryIsolate}`);
    INVALID_COUNTRIES.push(location.countryIsolate);
  }
  return {
    metadata: {
      sample: {
        isolateId: data.sample_name
      }
    }
  };
};

/**
 * Enhance data with geo codes
 * @param {*} geocodes
 */
const enhanceGeoCodes = async geocodes => {
  if (geocodes.length > 0) {
    for (let item of geocodes) {
      const countryIsolate = item.split("|")[0];
      const cityIsolate = item.split("|")[1];
      const address = {
        countryCode: countryIsolate,
        city: cityIsolate
      };
      logger.info(`Lookup geocode for ${JSON.stringify(address)}`);
      const location = await geocode(address);
      logger.info(`${location && location.length ? location.length : 0} matching location(s)`);
      if (location && Array.isArray(location)) {
        const geo = location.find(result => {
          const bothMatch =
            countryIsolate &&
            cityIsolate &&
            result.countryCode === countryIsolate &&
            result.city === cityIsolate;
          const countryOnlyMatch =
            countryIsolate && !cityIsolate && result.countryCode === countryIsolate;
          return bothMatch || countryOnlyMatch;
        });
        if (geo) {
          logger.info(`Geo match found ${geo.longitude}, ${geo.latitude}`);
          await Experiment.updateMany(
            {
              "metadata.sample.countryIsolate": countryIsolate,
              "metadata.sample.cityIsolate": cityIsolate
            },
            {
              "metadata.sample.latitudeIsolate": geo.latitude,
              "metadata.sample.longitudeIsolate": geo.longitude
            }
          );
        } else {
          logger.info(`No geo match found, ignore update`);
        }
      }
      // avoid hitting rate limit
      await DataHelper.sleep(1100);
    }
  }
};

const chunk = (array, size) => {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
};

export default DataHelper;
