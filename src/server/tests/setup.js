import mongoose from "mongoose";
import MongodbMemoryServer from "mongodb-memory-server";
import monq from "monq";
import config from "../../config/env";
import createApp from "../../config/express";
import errorsDefinition from "../../config/errors-definition";

require("../../express-jsend");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
let mongoServer;

errorsDefinition.create();

beforeAll(async () => {
  mongoServer = new MongodbMemoryServer({
    instance: {
      dbName: "atlas-test"
    },
    binary: {
      version: "3.6.1",
      ssl: true
    }
  });
  const mongoUri = await mongoServer.getConnectionString();
  await mongoose.connect(mongoUri, {}, err => {
    if (err) console.error(err);
  });
  config.db = mongoUri;
  config.monqClient = monq(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

export default { config, createApp };
