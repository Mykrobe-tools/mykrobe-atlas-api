import logger from "../modules/logger";
import { geocode } from "../modules/geo/";

import LocationHelper from "../helpers/LocationHelper";
import Experiment from "../models/experiment.model";

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

  static async initUploadState(experiment, body) {
    const {
      metadata: {
        sample: { isolateId }
      }
    } = body;

    const files = isolateId.split(",").map(name => {
      return {
        name: `${name.trim()}.gz`,
        uploaded: false
      };
    });
    experiment.set("files", files);
  }

  static async isUploadInProgress(id) {
    const experiment = await Experiment.get(id);
    const files = experiment.get("files");
    return files.find(file => file.uploaded === false);
  }

  static async markFileAsComplete(id, filename) {
    const experiment = await Experiment.get(id);
    const files = experiment.get("files");
    const experimentFiles = files.map(file => {
      if (file.name === filename) {
        return {
          name: filename,
          uploaded: true
        };
      }

      return file;
    });
    experiment.set("files", experimentFiles);
    await experiment.save();
  }

  static async localiseFilesForAnalysisApi(files) {
    if (files && Array.isArray(files)) {
      return files.map(file => this.localiseFilepathForAnalysisApi(file.name));
    }

    return [];
  }
}

export default ExperimentHelper;
