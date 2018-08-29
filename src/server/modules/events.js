import EventEmitter from "events";
import Experiment from "../models/experiment.model";
import Audit from "../models/audit.model";
import channels from "./channels";
import UploadProgressJSONTransformer from "../transformers/events/UploadProgressJSONTransformer";
import UploadCompleteJSONTransformer from "../transformers/events/UploadCompleteJSONTransformer";
import AnalysisStartedJSONTransformer from "../transformers/events/AnalysisStartedJSONTransformer";
import DistanceStartedJSONTransformer from "../transformers/events/DistanceStartedJSONTransformer";
import AnalysisCompleteJSONTransformer from "../transformers/events/AnalysisCompleteJSONTransformer";

const experimentEvent = new EventEmitter();

const sendExperimentOwnerEvent = (experiment, data, type) => {
  const owner = experiment.owner;
  if (owner) {
    const ownerId = owner.id || owner;
    if (ownerId) {
      const channel = channels.getUserChannel(ownerId);
      channel.send({ data });
    }
  }
};

experimentEvent.on("upload-progress", (experiment, uploadStatus) => {
  const data = new UploadProgressJSONTransformer().transform(uploadStatus, {
    id: experiment.id
  });
  sendExperimentOwnerEvent(experiment, data);
});

experimentEvent.on("upload-complete", (experiment, uploadStatus) => {
  const data = new UploadCompleteJSONTransformer().transform(uploadStatus, {
    id: experiment.id
  });
  sendExperimentOwnerEvent(experiment, data);
});

experimentEvent.on("analysis-started", async audit => {
  try {
    const experiment = await Experiment.get(audit.sampleId);
    const data = new AnalysisStartedJSONTransformer().transform(audit, {
      id: experiment.id
    });
    sendExperimentOwnerEvent(experiment, data);
  } catch (e) {}
});

experimentEvent.on("distance-search-started", async audit => {
  try {
    const experiment = await Experiment.get(audit.sampleId);
    const data = new DistanceStartedJSONTransformer().transform(audit, {
      id: experiment.id
    });
    sendExperimentOwnerEvent(experiment, data);
  } catch (e) {}
});

experimentEvent.on("analysis-complete", async payload => {
  try {
    const audit = await Audit.getBySample(payload.experiment.id);
    const data = new AnalysisCompleteJSONTransformer().transform(audit, {
      id: payload.experiment.id,
      results: payload.results
    });
    sendExperimentOwnerEvent(payload.experiment, data);
  } catch (e) {}
});

const events = Object.freeze({
  experimentEvent
});

export default events;
