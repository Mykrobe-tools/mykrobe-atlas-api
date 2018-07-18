import SseChannel from "sse-channel";

const experimentChannel = new SseChannel({
  jsonEncode: true
});

const channels = Object.freeze({
  experimentChannel
});

export default channels;
