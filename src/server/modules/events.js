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

experimentEventEmitter.on("upload-progress", (experiment, uploadStatus) => {
  const data = new UploadProgressJSONTransformer().transform(uploadStatus, {
    id: experiment.id
  });
  sendExperimentOwnerEvent(experiment, data);
});

experimentEventEmitter.on(
  "3rd-party-upload-progress",
  (experiment, uploadStatus) => {
    const data = new ThirdPartyUploadProgressJSONTransformer().transform(
      uploadStatus,
      {
        id: experiment.id
      }
    );
    sendExperimentOwnerEvent(experiment, data);
  }
);

experimentEventEmitter.on(
  "3rd-party-upload-complete",
  (experiment, uploadStatus) => {
    const data = new ThirdPartyUploadCompleteJSONTransformer().transform(
      uploadStatus,
      {
        id: experiment.id
      }
    );
    sendExperimentOwnerEvent(experiment, data);
  }
);

experimentEventEmitter.on("upload-complete", (experiment, uploadStatus) => {
  const data = new UploadCompleteJSONTransformer().transform(uploadStatus, {
    id: experiment.id
  });
  sendExperimentOwnerEvent(experiment, data);
});

experimentEventEmitter.on("analysis-started", async audit => {
  try {
    const experiment = await Experiment.get(audit.experimentId);
    const data = new AnalysisStartedJSONTransformer().transform(audit, {
      id: experiment.id
    });
    sendExperimentOwnerEvent(experiment, data);
  } catch (e) {}
});

experimentEventEmitter.on("analysis-complete", async payload => {
  try {
    const audit = await Audit.getByExperimentId(payload.experiment.id);
    const data = new AnalysisCompleteJSONTransformer().transform(audit, {
      id: payload.experiment.id,
      results: payload.results,
      type: payload.type
    });
    sendExperimentOwnerEvent(payload.experiment, data);
  } catch (e) {}
});

experimentEventEmitter.on("distance-search-started", async audit => {
  try {
    const experiment = await Experiment.get(audit.sampleId);
    const data = new DistanceStartedJSONTransformer().transform(audit, {
      id: experiment.id
    });
    sendExperimentOwnerEvent(experiment, data);
  } catch (e) {}
});

userEventEmitter.on("sequence-search-started", async audit => {
  try {
    const searchId = audit.searchId;
    const userId = audit.userId;
    if (searchId && userId) {
      const search = await Search.get(searchId);

      const data = new SearchStartedJSONTransformer().transform(audit, {
        search
      });
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on("sequence-search-complete", async audit => {
  try {
    const searchId = audit.searchId;
    const userId = audit.userId;
    if (searchId && userId) {
      const search = await Search.get(searchId);

      const data = new SearchCompleteJSONTransformer().transform(audit, {
        search
      });
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on("protein-variant-search-started", async audit => {
  try {
    const searchId = audit.searchId;
    const userId = audit.userId;
    if (searchId && userId) {
      const search = await Search.get(searchId);

      const data = new ProteinVariantSearchStartedJSONTransformer().transform(
        audit,
        {
          search
        }
      );
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

userEventEmitter.on("protein-variant-search-complete", async audit => {
  try {
    const searchId = audit.searchId;
    const userId = audit.userId;
    if (searchId && userId) {
      const search = await Search.get(searchId);

      const data = new ProteinVariantSearchCompleteJSONTransformer().transform(
        audit,
        {
          search
        }
      );
      sendUserEvent(userId, data);
    }
  } catch (e) {}
});

const events = Object.freeze({
  experimentEventEmitter,
  userEventEmitter
});

export default events;
