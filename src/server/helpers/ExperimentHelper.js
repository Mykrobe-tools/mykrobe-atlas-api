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
    logger.debug(`enhanceWithGeocode experiment: ${experiment}`);
    if (experiment) {
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

  static async initUploadState(experiment, body) {
    logger.debug(`isUploadInProgress experiment: ${experiment}`);
    const {
      metadata: {
        sample: { isolateId }
      }
    } = body;

    logger.debug(`isUploadInProgress isolateId: ${isolateId}`);
    const files = isolateId.split(",").map(name => {
      return {
        name,
        uploaded: false
      };
    });
    logger.debug(`isUploadInProgress files: ${files}`);
    experiment.set("files", files);

    try {
      logger.debug(`saving init ...`);
      await experiment.save();
    } catch (e) {
      logger.debug(`error init ...${e}`);
    }
  }

  static async isUploadInProgress(id) {
    logger.debug(`isUploadInProgress id: ${id}`);
    const experiment = await Experiment.get(id);
    logger.debug(`isUploadInProgress experiment id: ${experiment}`);
    const files = experiment.get("files");
    logger.debug(`isUploadInProgress files: ${files}`);
    const pendingFile = files.find(file => file.uploaded === false);
    logger.debug(`isUploadInProgress pendingFile: ${pendingFile}`);
    return pendingFile;
  }

  static async markFileAsComplete(id, filename) {
    logger.debug(`markFileAsComplete id: ${id} filename: ${filename}`);
    const experiment = await Experiment.get(id);
    logger.debug(`markFileAsComplete experiment: ${experiment}`);
    const files = experiment.get("files");
    logger.debug(`markFileAsComplete files: ${files}`);
    experiment.files = files.map(file => {
      if (file.name === filename) {
        return {
          name: filename,
          uploaded: true
        };

        return file;
      }
    });
    logger.debug(`markFileAsComplete experiment.files: ${experiment.files}`);
    try {
      logger.debug(`saving ...`);
      await experiment.save();
    } catch (e) {
      logger.debug(`error ...${e}`);
    }
  }
}

export default ExperimentHelper;
