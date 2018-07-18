import EventEmitter from "events";
import { experimentChannel } from "./channels";

const experimentEvent = new EventEmitter();

experimentEvent.on("upload-progress", function(uploadStatus) {
  experimentChannel.send({ data: uploadStatus });
});

experimentEvent.on("result-status", function(experiment) {
  experimentChannel.send({ data: experiment });
});

const events = Object.freeze({
  experimentEvent
});

export default events;
