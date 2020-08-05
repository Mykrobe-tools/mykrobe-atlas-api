import logger from "../modules/logger";
import { geocode } from "../modules/geo/";

import LocationHelper from "../helpers/LocationHelper";

import config from "../../config/env";

class ExperimentHelper {
  static localiseFilepathForAnalysisApi(filepath) {
    if (filepath) {
      const atlasApiDir = config.express.uploadsLocation;
      const analysisApiDir = config.express.analysisApiDir;

      if (atlasApiDir && analysisApiDir) {
        return filepath.replace(atlasApiDir, analysisApiDir);
      }

      return filepath;
    }

    return null;
  }
  static async enhanceWithGeocode(experiment) {
    const o = typeof experiment.toObject === "function" ? experiment.toObject() : experiment;
    if (o.metadata && o.metadata.sample) {
      const address = {};

      const countryIsolate = o.metadata.sample.countryIsolate;
      const cityIsolate = o.metadata.sample.cityIsolate;

      if (countryIsolate) {
        const name = LocationHelper.getCountry(countryIsolate);

        if (name) {
          address.country = name;
        } else {
          address.countryCode = countryIsolate;
        }
      }
      if (cityIsolate) {
        address.city = cityIsolate;
      }

      if (address) {
        try {
          const coordinates = await geocode(address);
          if (coordinates && coordinates.longitude && coordinates.latitude) {
            if (!experiment.metadata) {
              experiment.metadata = {};
            }
            if (!experiment.metadata.sample) {
              experiment.metadata.sample = {};
            }
            experiment.metadata.sample.latitudeIsolate = coordinates.latitude;
            experiment.metadata.sample.longitudeIsolate = coordinates.longitude;
          }
        } catch (e) {
          logger.debug(`Unable to fetch geocode for ${JSON.stringify(address)}.  Error: ${e}`);
        }
      }
    }
  }
}

export default ExperimentHelper;
