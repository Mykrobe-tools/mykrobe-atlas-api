import EventEmitter from "events";
import Experiment from "../models/experiment.model";
import Audit from "../models/audit.model";

import channels from "./channels";

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

const experimentEventEmitter = new EventEmitter();
const userEventEmitter = new EventEmitter();

const sendUserEvent = (userId, data) => {
  if (userId) {
    const channel = channels.getUserChannel(userId);
    channel.send({ data });
  }
};

const sendExperimentOwnerEvent = (experiment, data, type) => {
  const owner = experiment.owner;
  if (owner) {
    const ownerId = owner.id || owner;
    if (ownerId) {
      sendUserEvent(ownerId, data);
    }
  }
};

experimentEventEmitter.on("upload-progress", payload => {
  const { experiment, status } = payload;

  if (experiment && status) {
    const data = new UploadProgressJSONTransformer().transform(
      { experiment, status },
      {}
    );
    sendExperimentOwnerEvent(experiment, data);
  }
});

experimentEventEmitter.on("upload-complete", payload => {
  const { experiment, status } = payload;

  if (experiment && status) {
    const data = new UploadCompleteJSONTransformer().transform(
      { experiment, status },
      {}
    );
    sendExperimentOwnerEvent(experiment, data);
  }
});

experimentEventEmitter.on("3rd-party-upload-progress", payload => {
  const { experiment, status } = payload;

  if (experiment && status) {
    const data = new ThirdPartyUploadProgressJSONTransformer().transform(
      { experiment, status },
      {}
    );
    sendExperimentOwnerEvent(experiment, data);
  }
});

experimentEventEmitter.on("3rd-party-upload-complete", payload => {
  const { experiment, status } = payload;

  if (experiment && status) {
    const data = new ThirdPartyUploadCompleteJSONTransformer().transform(
      { experiment, status },
      {}
    );
    sendExperimentOwnerEvent(experiment, data);
  }
});

experimentEventEmitter.on("analysis-started", async audit => {
  try {
    const { experiment, audit } = payload;

    if (audit && experiment) {
      const data = new AnalysisStartedJSONTransformer().transform(
        { audit, experiment },
        {}
      );
      sendExperimentOwnerEvent(experiment, data);
    }
  } catch (e) {}
});

experimentEventEmitter.on("analysis-complete", async payload => {
  try {
    const { experiment, type, audit } = payload;

    if (experiment && type && audit) {
      const data = new AnalysisCompleteJSONTransformer().transform(
        {
          audit,
          experiment,
          type
        },
        {}
      );
      sendExperimentOwnerEvent(payload.experiment, data);
    }
  } catch (e) {}
});

experimentEventEmitter.on("distance-search-started", async payload => {
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
      sendExperimentOwnerEvent(experiment, data);
    }
  } catch (e) {}
});

userEventEmitter.on("sequence-search-started", async payload => {
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

userEventEmitter.on("sequence-search-complete", async payload => {
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

userEventEmitter.on("protein-variant-search-started", async payload => {
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

userEventEmitter.on("protein-variant-search-complete", async payload => {
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

userEventEmitter.on("dna-variant-search-complete", async audit => {
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
