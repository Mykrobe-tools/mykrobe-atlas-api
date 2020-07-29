import config from "../../../config/env";

import GeocoderFactory from "./GeocoderFactory";
const geocode = async location => {
  if (config.services.geo) {
    const geocoder = GeocoderFactory.getGeocoder(config.services.geo);
    if (geocoder) {
      const coordinates = await geocoder.geocode(location);
      return coordinates;
    }
  }

  return null;
};

export { geocode };
