import SseChannel from "sse-channel";

const USER = "user";

class Channels {
  constructor() {
    this.channels = {};
  }

  getUserChannel(id) {
    return this.getChannel(USER, id);
  }

  getChannel(type, id) {
    const channelId = this.getChannelId(type, id);

    if (!this.channels.hasOwnProperty(channelId)) {
      const channel = new SseChannel({
        jsonEncode: true,
        cors: {
          origins: ["*"]
        }
      });
      this.channels[channelId] = channel;
    }

    return this.channels[channelId];
  }

  getChannelId(type, id) {
    return `${type}_${id}`;
  }
}

const channels = new Channels();
export default channels;
