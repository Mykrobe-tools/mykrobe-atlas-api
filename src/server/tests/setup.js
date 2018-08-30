import mongoose from "mongoose";
import MongodbMemoryServer from "mongodb-memory-server";
import config from "../../config/env";
import errorsDefinition from "../../config/errors-definition";
import {
  mockAnalysisApiCalls,
  mockDistanceApiCalls,
  mockKeycloakCalls
} from "./mocks";

require("../../express-jsend");
jest.mock("../modules/agenda");
const createApp = require("../../server/app");

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
  config.db.uri = mongoUri;
  require("../../workers");
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

mockAnalysisApiCalls();
mockDistanceApiCalls();
mockKeycloakCalls();

export default { config, createApp };
