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

const geo = {
  cache: {},
  initialised: false
};

const BULK_INSERT_LIMIT = 1000;
const INVALID_COUNTRIES = [];

// countries mapping
const countriesMapping = {
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

const citiesMapping = {
  "Osaka, Osaka": "Osaka",
  "Hyogo, Kobe": "Hyogo",
  Midlands: "Birmingham",
  "Boston, MA": "Boston",
  "Worchester, MA": "Worcester",
  "MA, Worchester": "Worcester",
  "King George V Hospital, Durban": "Durban",
  "FOSA Hospital": "Pietermaritzburg",
  "Northdale Hospital - Ward C": "Pietermaritzburg",
  "Prince Msheyeni": "Umlazi",
  "Charles Johnson Memorial": "Nqutu",
  "Saint Margaret": "Cape Town",
  "Point G Hospital": "Bamako",
  Escourt: "Pretoria",
  Ngwelezane: "uMhlathuze Local Municipality",
  "Limpopo - Polokwane Hospital": "Polokwane",
  "Free State - JS Moroka Hospital": "Free State",
  "Eastern Cape - Alicedale Clinic": "Alicedale",
  "Northen Cape - Progress Clinic": "Upington",
  "Northen Cape - Keimoes Municipal Clinic": "Keimoes",
  "Prince Cyril Zulu CDC": "Durban", // ZA
  "Doris Goodwin Hospital - Parkhome Clinic": "Pietermaritzburg", // ZA
  "Inanda CHC": "Inanda",
  "Catherine Booth Hospital MDRTB Ward": "Amatikulu", // ZA
  "KDH MDR TB Clinic": "Nairobi", // KE - review
  "Thulasizwe Hopsital": "KwaZulu-Natal", // ZA
  "IALCH - A3E Endo/Resp/GI/Metab Ward": "Durban", // ZA
  "Umlazi U21 Clinic": "Umlazi", // ZA
  "Mahatma Gandhi Hospital - Ward 1": "Sitapura", // IN - review
  "Mahatma Gandhi Hospital - Ward 5": "Sitapura", // IN - review
  "Mahatma Gandhi": "Sitapura", // IN - review
  "Mahatma Gandhi Hospital - Casualty": "Sitapura", //IN - review,
  Ceza: "KwaZulu-Natal", // ZA
  "KDH MS1 Male TB Medical": "", // KE
  "Manguzi Hospital - MDR TB Clinic": "Manguzi", // ZA
  "Mosvold Hospital - isolation ward": "Ingwavuma", // ZA
  "Thalusizwe Hospital Outreach Clinic": "KwaZulu-Natal", // ZA
  "Manguzi Hospital - MDR TB Clinic": "Manguzi", // ZA
  "Murchison Hospital - MDR TB OPD": "", //ZA
  "Baltimore, MD": "Baltimore",
  MA: "Boston",
  "Baltimore, Maryland": "Baltimore",
  "Buenaventura, Valle del Cauca": "Buenaventura",
  "Durban Chest Clinic": "Durban",
  "King Dinuzulu Hospital": "Durban",
  Tiruvallur: "Thiruvallur",
  "east of BEIJING": "Beijing",
  "Mosvold Hospital - isolation ward": "Ingwavuma",
  "Murchison Hospital - MDR TB OPD": "Port Shepstone",
  "Umphumulo hospital": "KwaDukuza",
  "Ntuze clinic": "Empangeni",
  Ceza: "KwaZulu-Natal",
  "Mosvold Hospital": "Ingwavuma",
  "Murchison Hopsital": "Port Shepstone",
  "Manguzi Hospital": "Manguzi",
  "Untunjambili Hospital": "Kranskop",
  "Sundumbili Clinic": "Mandini",
  "Kwa-Mashu Poly Clinic": "KwaMashu",
  "Thokozani Clinic": "Empangeni",
  "Amakhabela Clinic": "Vukaphansi",
  "King Edward VIII Hospital": "Durban",
  "Edendale Hospital": "Pietermaritzburg",
  "Mpu, Muza Clinic": "The Msunduzi Rural",
  "Ngwelezana Hospital": "Empangeni",
  "Shallcross Clinic": "Durban",
  "Prince Mshiyeni Memorial Hospital": "Umlazi",
  "Doris Goodwin Hospital": "Pietermaritzburg",
  "Sihleza Clinic": "Ingwe Rural",
  "Kwazulu-Natal": "Durban",
  "Damien Foundation Project area": "", // BA,
  "Chiribaya Alta": "Chiribaya", // PE,
  Massachusetts: "Boston",
  Bucuresti: "Bucharest",
  "San Francisco, CA": "San Francisco",
  "Torres Strait Protected Zone": "", // AU
  MD: "Annapolis", // US
  VA: "Richmond",
  Supanburi: "Suphan Buri", // TH
  Andaman: "", // IN
  "The Sakha (Yakutia) Republic": "Yakutsk",
  "Gran Canaria": "Las Palmas de Gran Canaria",
  Tenerife: "Santa Cruz de Tenerife",
  Lanzarote: "Arrecife"
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
   * Load all files from a given path
   * @param {*} path
   */
  static async load(path) {
    if (!fs.existsSync(path)) {
      throw new Error(`Cannot find ${path} directory`);
    }

    const files = fs.readdirSync(path);
    for (let file of files) {
      if (file.includes(".tsv") || file.includes(".csv")) {
        await this.process(`${path}/${file}`);
      }
    }
  }

  /**
   * Load data set into memory
   * @param {*} filepath
   */
  static loadDataSet(filepath) {
    if (filepath) {
      const load = new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filepath);
        const rows = [];

        csv
          .fromStream(stream, { headers: true, delimiter: "\t" })
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
  static transform(rows) {
    const experiments = [];

    if (rows) {
      rows.forEach(row => {
        const isolateId = row.sample_name;
        const country = row.geo_metadata;

        const mappedCountry = this.transformCountry(country);

        const experiment = Object.assign({ isolateId }, mappedCountry);

        experiments.push(experiment);
      });
    }

    return experiments;
  }

  static transformCountry(country) {
    const location = {
      countryIsolate: "",
      cityIsolate: ""
    };

    if (country) {
      if (country.includes(":")) {
        const parts = country.split(":");
        location.countryIsolate = parts[0].trim();
        location.cityIsolate = parts[1].trim();
      } else if (country.toLowerCase() === "unknown") {
        // no change
      } else {
        location.countryIsolate = country.trim();
      }
    }

    // re-map
    if (location.countryIsolate || location.cityIsolate) {
      // countries which may map to country or country + city
      if (countriesMapping[location.countryIsolate]) {
        location.cityIsolate =
          countriesMapping[location.countryIsolate].city || location.cityIsolate;
        location.countryIsolate = countriesMapping[location.countryIsolate].country;
      }

      // remap cities which also have issues
      if (typeof citiesMapping[location.cityIsolate] !== "undefined") {
        location.cityIsolate = citiesMapping[location.cityIsolate];
      }
    }

    if (location.countryIsolate) {
      location.countryIsolateName = location.countryIsolate;

      const countryCode = this.getCountryCode(location.countryIsolate);
      location.countryIsolate = countryCode ? countryCode : null;
    }

    return location;
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
   * @param {*} experiments
   * @param {*} citiesAndCountries
   */
  static getCountryCode(country) {
    if (country) {
      const index = countryEnumNames.indexOf(country);
      if (index > -1) {
        return countryEnum[index];
      }
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
        const { isolateId, countryIsolate, cityIsolate, longitudeIsolate, latitudeIsolate } = row;
        const experiment = {
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
   * @param {*} filepath
   */
  static async process(filepath) {
    const rows = await this.loadDataSet(filepath);
    logger.debug(`${filepath} has ${rows.length} to process`);
    const structuredRows = this.transform(rows);

    const citiesAndCountries = this.getCitiesAndCountries(structuredRows);
    const structuredRowsWithGeoData = await this.enhanceWithGeoData(
      structuredRows,
      citiesAndCountries
    );

    const experiments = this.getExperiments(structuredRowsWithGeoData);
    logger.debug(`${filepath} has ${experiments.length} experiments to store`);
    const experimentChunks = this.chunk(experiments, BULK_INSERT_LIMIT);

    for (let experimentChunk of experimentChunks) {
      await Experiment.insertMany(experimentChunk);
      logger.debug(`Stored ${experimentChunk.length} experiments of ${rows.length}`);
    }

    return {
      filepath,
      count: experiments.length
    };
  }
}

export default DataHelper;
