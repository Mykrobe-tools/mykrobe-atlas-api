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
    const response = await axios.post(uri, payload);
    if (response && response.data && response.data.id) {
      const sampleId = response.data.id;
      logger.debug(`TrackingService#getTrackingId: sampleId: ${sampleId}`);
      return sampleId;
    }

    throw new Error(`Call to tracking service failed.  Missing response`);
  }
}

export default TrackingService;
