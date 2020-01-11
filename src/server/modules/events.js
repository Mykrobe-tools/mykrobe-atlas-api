import EventEmitter from "events";
import Experiment from "../models/experiment.model";
import Audit from "../models/audit.model";

import channels from "./channels";

import Constants from "../Constants";

import UploadProgressJSONTransformer from "../transformers/events/UploadProgressJSONTransformer";
import UploadCompleteJSONTransformer from "../transformers/events/UploadCompleteJSONTransformer";
import AnalysisStartedJSONTransformer from "../transformers/events/AnalysisStartedJSONTransformer";
import DistanceStartedJSONTransformer from "../transformers/events/DistanceStartedJSONTransformer";
import AnalysisCompleteJSONTransformer from "../transformers/events/AnalysisCompleteJSONTransformer";
import ThirdPartyUploadProgressJSONTransformer from "../transformers/events/ThirdPartyUploadProgressJSONTransformer";
import ThirdPartyUploadCompleteJSONTransformer from "../transformers/events/ThirdPartyUploadCompleteJSONTransformer";
import SequenceSearchStartedEventJSONTransformer from "../transformers/events/SequenceSearchStartedEventJSONTransformer";
import SequenceSearchCompleteEventJSONTransformer from "../transformers/events/SequenceSearchCompleteEventJSONTransformer";
import ProteinVariantSearchStartedEventJSONTransformer from "../transformers/events/ProteinVariantSearchStartedEventJSONTransformer";
import ProteinVariantSearchCompleteEventJSONTransformer from "../transformers/events/ProteinVariantSearchCompleteEventJSONTransformer";

import logger from "./winston";

const experimentEventEmitter = new EventEmitter();
const userEventEmitter = new EventEmitter();

const sendUserEvent = (userId, data) => {
  logger.info(`#sendUserEvent: userId: ${JSON.stringify(userId, null, 2)}`);
  if (userId) {
    const channel = channels.getUserChannel(userId);
    logger.info(`#sendUserEvent: data: ${JSON.stringify(data, null, 2)}`);
    channel.send({ data });
  }
};

const sendExperimentOwnerEvent = (experiment, data, type) => {
  logger.info(`#sendExperimentOwnerEvent: type: ${type}`);
  const owner = experiment.owner;
  logger.info(`#sendExperimentOwnerEvent: owner: ${JSON.stringify(owner, null, 2)}`);
  if (owner) {
    const ownerId = owner.id || owner;
    logger.info(`#sendExperimentOwnerEvent: ownerId: ${JSON.stringify(ownerId, null, 2)}`);
    if (ownerId) {
      sendUserEvent(ownerId, data);
    }
  }
};

experimentEventEmitter.on(Constants.EVENTS.UPLOAD_PROGRESS.EVENT, payload => {
  const { experiment, status } = payload;

  if (experiment && status) {
    const data = new UploadProgressJSONTransformer().transform({ experiment, status }, {});
    sendExperimentOwnerEvent(experiment, data, Constants.EVENTS.UPLOAD_PROGRESS.EVENT);
  }
});

experimentEventEmitter.on(Constants.EVENTS.UPLOAD_COMPLETE.EVENT, payload => {
  const { experiment, status } = payload;

  if (experiment && status) {
    const data = new UploadCompleteJSONTransformer().transform({ experiment, status }, {});
    sendExperimentOwnerEvent(experiment, data, Constants.EVENTS.UPLOAD_COMPLETE.EVENT);
  }
});

experimentEventEmitter.on(Constants.EVENTS.THIRD_PARTY_UPLOAD_PROGRESS.EVENT, payload => {
  const { experiment, status } = payload;

  if (experiment && status) {
    const data = new ThirdPartyUploadProgressJSONTransformer().transform(
      { experiment, status },
      {}
    );
    sendExperimentOwnerEvent(experiment, data, Constants.EVENTS.THIRD_PARTY_UPLOAD_PROGRESS.EVENT);
  }
});

experimentEventEmitter.on(Constants.EVENTS.THIRD_PARTY_UPLOAD_COMPLETE.EVENT, payload => {
  const { experiment, status } = payload;

  if (experiment && status) {
    const data = new ThirdPartyUploadCompleteJSONTransformer().transform(
      { experiment, status },
      {}
    );
    sendExperimentOwnerEvent(experiment, data, Constants.EVENTS.THIRD_PARTY_UPLOAD_COMPLETE.EVENT);
  }
});

experimentEventEmitter.on(Constants.EVENTS.ANALYSIS_STARTED.EVENT, async payload => {
  logger.info(`analysis-started event`);
  try {
    logger.info(`analysis-started: payload: ${JSON.stringify(payload, null, 2)}`);
    const { experiment, audit } = payload;

    if (audit && experiment) {
      logger.info(`analysis-started: transforming event`);
      const data = new AnalysisStartedJSONTransformer().transform({ audit, experiment }, {});
      logger.info(`analysis-started: data: ${JSON.stringify(data, null, 2)}`);
      logger.info(`analysis-started: sending event`);
      sendExperimentOwnerEvent(experiment, data, Constants.EVENTS.ANALYSIS_STARTED.EVENT);
    }
  } catch (e) {
    logger.info(`analysis-started: error: ${JSON.stringify(e, null, 2)}`);
  }
});

experimentEventEmitter.on(Constants.EVENTS.ANALYSIS_COMPLETE.EVENT, async payload => {
  logger.info(`analysis-completed event`);
  try {
    logger.info(`analysis-completed: payload: ${JSON.stringify(payload, null, 2)}`);
    const { experiment, type, audit } = payload;
    if (experiment && type && audit) {
      logger.info(`analysis-completed: transforming event`);
      const data = new AnalysisCompleteJSONTransformer().transform(
        {
          audit,
          experiment,
          type
        },
        {}
      );
      logger.info(`analysis-completed: data: ${JSON.stringify(data, null, 2)}`);
      logger.info(`analysis-completed: sending event`);
      sendExperimentOwnerEvent(payload.experiment, data, Constants.EVENTS.ANALYSIS_COMPLETE.EVENT);
    }
  } catch (e) {
    logger.info(`analysis-completed: error: ${JSON.stringify(e, null, 2)}`);
  }
});

experimentEventEmitter.on(Constants.EVENTS.DISTANCE_SEARCH_STARTED.EVENT, async payload => {
  try {
    const { experiment, audit } = payload;

    if (audit && experiment) {
      const data = new DistanceStartedJSONTransformer().transform(
        {
          audit,
          experiment
        },
        {}
      );
      sendExperimentOwnerEvent(experiment, data, Constants.EVENTS.DISTANCE_SEARCH_STARTED.EVENT);
    }
  } catch (e) {}
});

userEventEmitter.on(Constants.EVENTS.SEQUENCE_SEARCH_STARTED.EVENT, async payload => {
  try {
    const { audit, search, user } = payload;

    if (audit && search && user) {
      const data = new SequenceSearchStartedEventJSONTransformer().transform(
        {
          audit,
          search,
          user
        },
        {}
      );

      const userId = user.id;
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on(Constants.EVENTS.SEQUENCE_SEARCH_COMPLETE.EVENT, async payload => {
  try {
    const { audit, search, user } = payload;

    if (audit && search && user) {
      const data = new SequenceSearchCompleteEventJSONTransformer().transform(
        {
          audit,
          search,
          user
        },
        {}
      );

      const userId = user.id;
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on(Constants.EVENTS.PROTEIN_VARIANT_SEARCH_STARTED.EVENT, async payload => {
  try {
    const { search, audit, user } = payload;

    if (audit && search && user) {
      const data = new ProteinVariantSearchStartedEventJSONTransformer().transform(
        {
          audit,
          search,
          user
        },
        {}
      );

      const userId = user.id;
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on(Constants.EVENTS.PROTEIN_VARIANT_SEARCH_COMPLETE.EVENT, async payload => {
  try {
    const { search, audit, user } = payload;

    if (audit && search && user) {
      const data = new ProteinVariantSearchCompleteEventJSONTransformer().transform(
        {
          audit,
          search,
          user
        },
        {}
      );
      const userId = user.id;
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on(Constants.EVENTS.DNA_VARIANT_SEARCH_STARTED.EVENT, async audit => {
  try {
    const { experiment, audit, user } = payload;

    if (audit && search && user) {
      const data = new DnaVariantSearchStartedJSONTransformer().transform(
        {
          audit,
          search,
          user
        },
        {}
      );
      const userId = user.id;
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

const events = Object.freeze({
  experimentEventEmitter,
  userEventEmitter
});

export default events;
