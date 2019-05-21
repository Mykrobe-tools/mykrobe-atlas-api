import logger from "../modules/winston";
import { geocode } from "../modules/geo";

class ExperimentHelper {
  static async enhanceWithGeocode(experiment) {
    const o = typeof experiment.toObject === "function" ? experiment.toObject() : experiment;
    if (o.metadata && o.metadata.sample) {
      const address = {};

      const countryIsolate = o.metadata.sample.countryIsolate;
      const cityIsolate = o.metadata.sample.cityIsolate;

      if (countryIsolate) {
        address.countryCode = countryIsolate;
      }
      if (cityIsolate) {
        address.city = cityIsolate;
      }

      if (address) {
        try {
          const location = await geocode(address);
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
              if (!experiment.metadata) {
                experiment.metadata = {};
              }
              if (!experiment.metadata.sample) {
                experiment.metadata.sample = {};
              }
              experiment.metadata.sample.latitudeIsolate = geo.latitude;
              experiment.metadata.sample.longitudeIsolate = geo.longitude;
            }
          }
        } catch (e) {
          logger.debug(`Unable to fetch geocode for ${JSON.stringify(address)}.  Error: ${e}`);
        }
      }
    }
  }
}

export default ExperimentHelper;
