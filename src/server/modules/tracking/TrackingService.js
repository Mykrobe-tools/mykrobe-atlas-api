import axios from "axios";
import logger from "../logging/logger";
import config from "../../../config/env";

class TrackingService {
  constructor() {}

  async upsert(experimentId, isolateId = null) {
    if (!experimentId) {
      throw new Error(`Call to tracking service failed.  Missing experimentId`);
    }

    const tracking = await this.get(experimentId, isolateId);

    // create if missing
    if (!tracking) {
      const sampleId = await this.create(isolateId, experimentId);
      return sampleId;
    }

    const { fetchedTrackingId, fetchedExperimentId } = tracking;

    if (!fetchedExperimentId || fetchedExperimentId !== experimentId) {
      await this.update(fetchedTrackingId, experimentId);
    }

    return fetchedTrackingId;
  }

  async get(experimentId, isolateId) {
    if (!isolateId) {
      return null;
    }

    const uri = `${config.services.trackingApiUrl}/samples`;
    logger.debug(`TrackingService#get: GET ${uri}?isolate_id=${isolateId}`);
    // note cannot call with body, only query stirng
    const filterUri = `${uri}?isolate_id=${isolateId}`;

    try {
      const response = await axios.get(filterUri);

      if (response && response.data) {
        logger.debug(`TrackingService#get: Response: ${JSON.stringify(response.data)}`);
        if (Array.isArray(response.data) && response.data.length) {
          logger.debug(`TrackingService#get: Data is an array`);
          const first = response.data[0];
          logger.debug(`TrackingService#get: First element: ${JSON.stringify(first, null, 2)}`);

          if (first) {
            const fetchedTrackingId = first["id"];
            logger.debug(`TrackingService#get: Tracking Id: ${fetchedTrackingId}`);
            const fetchedExperimentId = first["experiment-id"];
            logger.debug(`TrackingService#get: Experiment Id: ${fetchedExperimentId}`);

            return { fetchedTrackingId, fetchedExperimentId };
          }
        }
      }

      return null;
    } catch (e) {
      logger.debug(`TrackingService#get: Unable to filter and find an id for ${isolateId}`);
      logger.debug(`TrackingService#get: Error: ${JSON.stringify(e, null, 2)}`);
      return null;
    }
  }

  async create(experimentId, isolateId) {
    const uri = `${config.services.trackingApiUrl}/samples`;
    const payload = {
      "experiment-id": experimentId
    };

    if (isolateId) {
      payload["isolate-id"] = isolateId;
    }

    logger.debug(`TrackingService#create: POST ${uri}`);
    logger.debug(`TrackingService#create: payload: ${JSON.stringify(payload, null, 2)}`);

    try {
      const response = await axios.post(uri, payload);
      if (response && response.data && response.data.id) {
        const sampleId = response.data.id;
        logger.debug(`TrackingService#create: sampleId: ${sampleId}`);
        return sampleId;
      }
    } catch (e) {
      logger.debug(`TrackingService#create: Error: ${JSON.stringify(e.response, null, 2)}`);
      return null;
    }
  }

  async update(trackingId, experimentId) {
    const uri = `${config.services.trackingApiUrl}/samples`;
    const updateUri = `${uri}/${trackingId}`;
    const updatePayload = {
      "experiment-id": experimentId
    };
    logger.debug(`TrackingService#getTrackingId: PATCH ${updateUri}`);
    logger.debug(
      `TrackingService#getTrackingId: payload: ${JSON.stringify(updatePayload, null, 2)}`
    );

    try {
      const patchResponse = await axios.patch(updateUri, updatePayload);
      if (patchResponse && patchResponse.data) {
        logger.debug(`TrackingService#update: patch response: ${JSON.stringify(patchResponse)}`);
      } else {
        logger.debug(`TrackingService#update: patch response invalid`);
      }
    } catch (e) {
      logger.debug(`TrackingService#update: Unable to patch ${fetchedTrackingId}`);
      if (e.response) {
        logger.debug(`TrackingService#update: Error: ${JSON.stringify(e.response, null, 2)}`);
      }
    }
  }

  /*
  async upsert(experimentId, isolateId = null) {
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
              logger.debug(`TrackingService#getTrackingId: Data is an array`);
              const first = response.data[0];
              logger.debug(
                `TrackingService#getTrackingId: First element: ${JSON.stringify(first, null, 2)}`
              );
              if (first) {
                const fetchedTrackingId = first["id"];
                logger.debug(`TrackingService#getTrackingId: Tracking Id: ${fetchedTrackingId}`);
                const fetchedExperimentId = first["experiment-id"];
                logger.debug(
                  `TrackingService#getTrackingId: Experiment Id: ${fetchedExperimentId}`
                );
                if (fetchedTrackingId) {
                  if (fetchedExperimentId && fetchedTrackingId !== experimentId) {
                    const updateUri = `${uri}/${fetchedTrackingId}`;
                    const updatePayload = {
                      "experiment-id": experimentId
                    };
                    logger.debug(`TrackingService#getTrackingId: PATCH ${updateUri}`);
                    logger.debug(
                      `TrackingService#getTrackingId: payload: ${JSON.stringify(
                        updatePayload,
                        null,
                        2
                      )}`
                    );
                    try {
                      const patchResponse = await axios.patch(updateUri, updatePayload);
                      if (patchResponse && patchResponse.data) {
                        logger.debug(
                          `TrackingService#getTrackingId: patch response: ${JSON.stringify(
                            patchResponse
                          )}`
                        );
                      } else {
                        logger.debug(`TrackingService#getTrackingId: patch response invalid`);
                      }
                    } catch (patchError) {
                      logger.debug(
                        `TrackingService#getTrackingId: Unable to patch ${fetchedTrackingId}`
                      );
                      if (patchError.response) {
                        logger.debug(
                          `TrackingService#getTrackingId: Error: ${JSON.stringify(
                            patchError.response,
                            null,
                            2
                          )}`
                        );
                      }
                    }
                    return fetchedTrackingId;
                  }
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
  */
}

export default TrackingService;
