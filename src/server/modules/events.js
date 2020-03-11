import EventEmitter from "events";

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
import DnaVariantSearchStartedEventJSONTransformer from "../transformers/events/DnaVariantSearchStartedEventJSONTransformer";
import DnaVariantSearchCompleteEventJSONTransformer from "../transformers/events/DnaVariantSearchCompleteEventJSONTransformer";

import logger from "./winston";

const experimentEventEmitter = new EventEmitter();
const userEventEmitter = new EventEmitter();

const sendUserEvent = (userId, data) => {
  logger.debug(`sendUserEvent: userId: ${userId}`);
  if (userId) {
    const channel = channels.getUserChannel(userId);
    channel.send({ data });
  }
};

const sendExperimentOwnerEvent = (experiment, data, type) => {
  const owner = experiment.owner;
  logger.debug(`sendExperimentOwnerEvent: owner: ${owner}`);
  if (owner) {
    const ownerId = owner.id || owner;
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
  try {
    const { experiment, audit } = payload;

    if (audit && experiment) {
      const data = new AnalysisStartedJSONTransformer().transform(
        { audit, experiment, fileLocation: audit.fileLocation },
        {}
      );
      sendExperimentOwnerEvent(experiment, data, Constants.EVENTS.ANALYSIS_STARTED.EVENT);
    }
  } catch (e) {
    logger.error(`analysis-started: error: ${JSON.stringify(e, null, 2)}`);
  }
});

experimentEventEmitter.on(Constants.EVENTS.ANALYSIS_COMPLETE.EVENT, async payload => {
  try {
    const { experiment, type, audit } = payload;
    logger.debug(`Analysis complete`);
    if (experiment && type && audit) {
      logger.debug(`Analysis complete data valid: ${JSON.stringify(payload, null, 2)}`);
      const data = new AnalysisCompleteJSONTransformer().transform(payload, {});
      logger.debug(`Analysis complete transformed data: ${JSON.stringify(data, null, 2)}`);
      sendExperimentOwnerEvent(payload.experiment, data, Constants.EVENTS.ANALYSIS_COMPLETE.EVENT);
    }
  } catch (e) {
    logger.error(`analysis-completed: error: ${JSON.stringify(e, null, 2)}`);
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
    logger.debug(`Sequence search started`);
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
      logger.debug(`Sequence search started: Send event`);
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on(Constants.EVENTS.SEQUENCE_SEARCH_COMPLETE.EVENT, async payload => {
  try {
    logger.debug(`Sequence search complete`);
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
      logger.debug(`Sequence search complete: Send event`);
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on(Constants.EVENTS.PROTEIN_VARIANT_SEARCH_STARTED.EVENT, async payload => {
  try {
    logger.debug(`Protein variant search started`);
    const { search, audit, user } = payload;

    logger.debug(`userEventEmitter: audit: ${JSON.stringify(audit, null, 2)}`);
    logger.debug(`userEventEmitter: user: ${JSON.stringify(user, null, 2)}`);
    logger.debug(`userEventEmitter: search: ${JSON.stringify(search, null, 2)}`);

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
      logger.debug(`Protein variant search started: Send event`);
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on(Constants.EVENTS.PROTEIN_VARIANT_SEARCH_COMPLETE.EVENT, async payload => {
  try {
    logger.debug(`Protein variant search complete`);
    const { search, audit, user } = payload;

    logger.debug(`userEventEmitter: audit: ${JSON.stringify(audit, null, 2)}`);
    logger.debug(`userEventEmitter: user: ${JSON.stringify(user, null, 2)}`);
    logger.debug(`userEventEmitter: search: ${JSON.stringify(search, null, 2)}`);

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
      logger.debug(`Protein variant search complete: Send event`);
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on(Constants.EVENTS.DNA_VARIANT_SEARCH_STARTED.EVENT, async payload => {
  try {
    logger.debug(`DNA variant search started`);
    const { search, audit, user } = payload;

    logger.debug(`userEventEmitter: audit: ${JSON.stringify(audit, null, 2)}`);
    logger.debug(`userEventEmitter: user: ${JSON.stringify(user, null, 2)}`);
    logger.debug(`userEventEmitter: search: ${JSON.stringify(search, null, 2)}`);

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
      logger.debug(`DNA variant search started: Send event`);
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on(Constants.EVENTS.DNA_VARIANT_SEARCH_COMPLETE.EVENT, async payload => {
  try {
    logger.debug(`DNA variant search complete`);
    const { search, audit, user } = payload;

    logger.debug(`userEventEmitter: audit: ${JSON.stringify(audit, null, 2)}`);
    logger.debug(`userEventEmitter: user: ${JSON.stringify(user, null, 2)}`);
    logger.debug(`userEventEmitter: search: ${JSON.stringify(search, null, 2)}`);

    if (audit && search && user) {
      const data = new DnaVariantSearchCompletedJSONTransformer().transform(
        {
          audit,
          search,
          user
        },
        {}
      );
      const userId = user.id;
      logger.debug(`DNA variant search complete: Send event`);
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

const events = Object.freeze({
  experimentEventEmitter,
  userEventEmitter
});

export default events;
