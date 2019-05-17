import fs from "fs";
import csv from "fast-csv";
import { experiment as experimentJsonSchema } from "mykrobe-atlas-jsonschema";
import SchemaExplorer from "makeandship-api-common/lib/modules/jsonschema/schema-explorer";
import Experiment from "../models/experiment.model";
import ExperimentJSONTransformer from "../transformers/ExperimentJSONTransformer";

// constants
const explorer = new SchemaExplorer(experimentJsonSchema);
const countryEnum = explorer.getAttributeBy("metadata.sample.countryIsolate", "enum");
const countryEnumNames = explorer.getAttributeBy("metadata.sample.countryIsolate", "enumNames");
const BULK_INSERT_LIMIT = 1000;
const INVALID_COUNTRIES = [];

// countries mapping
const contriesMapping = {
  USA: "United States",
  "Cote d'Ivoire": "Ivory Coast (Cote D'Ivoire)",
  "Viet Nam": "Vietnam",
  Azerbaijan: "Azerbaidjan",
  Moldova: "Moldavia",
  Russia: "Russian Federation",
  Tajikistan: "Tadjikistan",
  Korea: "South Korea",
  "Canada;Ontario": "Canada",
  "Democratic Republic of the Congo": "Congo",
  "Canada;Toronto": "Canada",
  "Beijing, China": "China",
  PERU: "Peru",
  UK: "United Kingdom",
  "Côte d'Ivoire": "Ivory Coast (Cote D'Ivoire)",
  "USA, San Francisco": "United States",
  "New Guinea": "Guinea",
  Valencia: "Spain",
  Lanzarote: "Spain",
  "Gran Canaria": "Spain",
  Tenerife: "Spain",
  Fuerteventura: "Spain",
  Zaragoza: "Spain"
};

class DataHelper {
  /**
   * Load all files from a given path
   * @param {*} path
   */
  static loadDemoData(path) {
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
      counter = 0;
    console.log("data load started...");
    csv
      .fromStream(stream, { headers: true, delimiter: "\t" })
      .transform(data => transform(data))
      .on("data", async data => {
        stream.pause();
        buffer.push(data);
        counter++;
        try {
          if (counter === BULK_INSERT_LIMIT) {
            await Experiment.insertMany(buffer);
            console.log(`insert ${buffer.length} records`);
            buffer = [];
            counter = 0;
          }
        } catch (e) {
          console.log(`error: ${JSON.stringify(e)}`);
          stream.destroy(e);
        }
        stream.resume();
      })
      .on("end", async () => {
        try {
          if (counter > 0) {
            await Experiment.insertMany(buffer);
            console.log(`insert ${buffer.length} records`);
          }
          console.log("data load ended.");
        } catch (e) {
          console.log(`error: ${JSON.stringify(e)}`);
          stream.destroy(e);
        }
      });
  }
}

/**
 * Transform the data to a format supported by the schema
 * @param {*} data
 */
const transform = data => {
  let countryIsolate, cityIsolate;
  const geoMetadata = data.geo_metadata;
  if (geoMetadata.indexOf(":") > -1) {
    const geoArray = geoMetadata.split(":");
    countryIsolate = geoArray[0].trim();
    cityIsolate = geoArray[1].trim();
  } else if (geoMetadata.toLowerCase() === "unknown") {
    countryIsolate = "";
    cityIsolate = "";
  } else {
    countryIsolate = geoMetadata.trim();
    cityIsolate = "";
  }
  countryIsolate = contriesMapping[countryIsolate] || countryIsolate;
  const index = countryEnumNames.indexOf(countryIsolate);
  if (countryEnum[index]) {
    return {
      metadata: {
        sample: {
          isolateId: data.sample_name,
          countryIsolate: countryEnum[index],
          cityIsolate
        }
      }
    };
  }

  if (INVALID_COUNTRIES.indexOf(countryIsolate) === -1) {
    console.log(`Invalid country found: ${countryIsolate}`);
    INVALID_COUNTRIES.push(countryIsolate);
  }
  return {
    metadata: {
      sample: {
        isolateId: data.sample_name
      }
    }
  };
};

export default DataHelper;
