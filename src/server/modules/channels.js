import SseChannel from "sse-channel";

const liveChannels = {};

const getUserChannel = userId => {
  if (liveChannels[userId]) {
    return liveChannels[userId];
  }
  const userChannel = new SseChannel({ jsonEncode: true });
  liveChannels[userId] = userChannel;
  return userChannel;
};

const channels = Object.freeze({
  getUserChannel
});

export default channels;
