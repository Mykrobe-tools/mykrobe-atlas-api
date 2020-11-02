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
    } catch (e) {
      logger.debug(`TrackingService#getTrackingId: error creating sampleId`);
      // if duplicate, perform a lookup
      if (e && e.response && e.response.status === 409) {
        logger.debug(`TrackingService#getTrackingId: sampleId exists`);
        const payloadGet = {
          isolate_id: isolateId
        };
        logger.debug(`TrackingService#getTrackingId: GET ${uri}`);
        logger.debug(`TrackingService#getTrackingId: payload: ${JSON.stringify(payload, null, 2)}`);
        const response = await axios.get(uri, payload);
        if (response && response.data) {
          logger.debug(`TrackingService#getTrackingId: Response: ${JSON.stringify(response.data)}`);
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
      }

      throw new Error(`Call to tracking service failed.  Missing response`);
    }
  }
}

export default TrackingService;
