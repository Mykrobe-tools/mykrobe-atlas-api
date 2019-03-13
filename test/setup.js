import mongoose from "mongoose";
import MongodbMemoryServer from "mongodb-memory-server";
import config from "../src/config/env";
import errorsDefinition from "../src/config/errors-definition";
import {
  mockAnalysisApiCalls,
  mockDistanceApiCalls,
  mockKeycloakCalls,
  mockThirdPartyCalls,
  mockSearchApiCalls,
  mockTreeApiCalls,
  mockIsolateIdMappingCalls
} from "./mocks";

require("../src/express-jsend");
jest.mock("../src/server/modules/agenda");
const createApp = require("../src/server/app");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
let mongoServer;

errorsDefinition.create();

beforeAll(async done => {
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

  done();
});

mockAnalysisApiCalls();
mockDistanceApiCalls();
mockSearchApiCalls();
mockTreeApiCalls();
mockKeycloakCalls();
mockThirdPartyCalls();
mockIsolateIdMappingCalls();

export default { config, createApp };
