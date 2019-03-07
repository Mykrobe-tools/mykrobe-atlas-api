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
import { initialise as initialiseWorkers } from "../src/workers";

require("../src/express-jsend");
jest.mock("../src/server/modules/agenda");
const createApp = require("../src/server/app");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
let mongoServer;

errorsDefinition.create();

beforeAll(async done => {
  console.log(`beforeAll`);
  mongoServer = new MongodbMemoryServer({
    instance: {
      dbName: "atlas-test"
    },
    binary: {
      version: "3.6.1",
      ssl: true
    }
  });
  console.log(`beforeAll: server created`);
  const mongoUri = await mongoServer.getConnectionString();
  console.log(`beforeAll: mongoUri: ${mongoUri}`);
  await mongoose.connect(mongoUri, {}, err => {
    if (err) console.error(err);
  });
  config.db.uri = mongoUri;
  console.log(`beforeAll: config.db.uri: ${config.db.uri}`);
  initialiseWorkers();
  console.log(`beforeAll: initialiseWorkers complete`);
  done();
});

afterAll(async () => {
  console.log(`disconnecting ...`);
  await mongoose.disconnect();
  console.log(`disconnected`);
  console.log(`stopping ...`);
  await mongoServer.stop();
  console.log(`stopped`);
});

mockAnalysisApiCalls();
mockDistanceApiCalls();
mockSearchApiCalls();
mockTreeApiCalls();
mockKeycloakCalls();
mockThirdPartyCalls();
mockIsolateIdMappingCalls();

export default { config, createApp };
