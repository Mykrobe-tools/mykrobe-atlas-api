import EventEmitter from "events";
import channels from "./channels";

const experimentEvent = new EventEmitter();

const sendExperimentOwnerEvent = (experiment, data, type) => {
  const owner = experiment.owner;
  if (owner) {
    const ownerId = owner.id;
    if (ownerId) {
      const channel = channels.getUserChannel(ownerId);
      channel.send({ data });
    }
  }
};

experimentEvent.on("upload-progress", function(experiment, uploadStatus) {
  sendExperimentOwnerEvent(experiment, uploadStatus, "upload-progress");
});

experimentEvent.on("upload-complete", function(experiment, uploadStatus) {
  sendExperimentOwnerEvent(experiment, uploadStatus, "upload-complete");
});

experimentEvent.on("analysis-started", function(experiment) {
  sendExperimentOwnerEvent(experiment, experiment, "analysis-started");
});

experimentEvent.on("analysis-complete", function(experiment) {
  sendExperimentOwnerEvent(experiment, experiment, "analysis-complete");
});

const events = Object.freeze({
  experimentEvent
});

export default events;
