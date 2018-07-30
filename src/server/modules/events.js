import EventEmitter from "events";
import channels from "./channels";

const experimentEvent = new EventEmitter();

const sendExperimentOwnerEvent = (experiment, data, type) => {
  console.log(`sendExperimentOwnerEvent #1`);
  const owner = experiment.owner;
  if (owner) {
    console.log(`sendExperimentOwnerEvent #2`);
    const ownerId = owner.id;
    console.log(`sendExperimentOwnerEvent ownerId: ${ownerId}`);
    if (ownerId) {
      const channel = channels.getUserChannel(ownerId);
      console.log(`sendExperimentOwnerEvent channel: ${channel}`);
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
