import axios from "axios";
import logger from "../logger";
import config from "../../../config/env";

class TrackingService {
  constructor() {}

  async getTrackingId(experimentId, isolateId = null) {
    if (!experimentId) {
      throw new Error(`Call to tracking service failed.  Missing experimentId`);
    }

    const uri = `${config.services.trackingApiUrl}/samples`;
    const payload = {
      "experiment-id": experimentId
    };

    if (isolateId) {
      payload["isolate-id"] = isolateId;
    }

    logger.debug(`TrackingService#getTrackingId: POST ${uri}`);
    logger.debug(`TrackingService#getTrackingId: payload: ${JSON.stringify(payload, null, 2)}`);
    try {
      const response = await axios.post(uri, payload);
      if (response && response.data && response.data.id) {
        const sampleId = response.data.id;
        logger.debug(`TrackingService#getTrackingId: sampleId: ${sampleId}`);
        return sampleId;
      }
    } catch (createError) {
      logger.debug(`TrackingService#getTrackingId: error creating sampleId`);
      // if duplicate, perform a lookup
      if (createError && createError.response && createError.response.status === 409) {
        logger.debug(`TrackingService#getTrackingId: sampleId exists`);
        const payloadGet = {
          isolate_id: isolateId
        };
        logger.debug(`TrackingService#getTrackingId: GET ${uri}?isolate_id=${isolateId}`);
        // note cannot call with body, only query stirng
        const filterUri = `${uri}?isolate_id=${isolateId}`;
        try {
          const response = await axios.get(filterUri);
          if (response && response.data) {
            logger.debug(
              `TrackingService#getTrackingId: Response: ${JSON.stringify(response.data)}`
            );
            if (Array.isArray(response.data)) {
              const first = response.data[0];
              if (first) {
                const fetchedTrackingId = first["tracking-id"];
                if (fetchedTrackingId) {
                  return fetchedTrackingId;
                }
              }
            }
          }
        } catch (filterError) {
          logger.debug(
            `TrackingService#getTrackingId: Unable to filter and find an id for ${isolateId}`
          );
          logger.debug(
            `TrackingService#getTrackingId: Error: ${JSON.stringify(filterError, null, 2)}`
          );
        }
      }

      throw new Error(`Call to tracking service failed.  Missing response`);
    }
  }
}

export default TrackingService;
