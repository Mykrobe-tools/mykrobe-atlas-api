import mongoose from "mongoose";
import MongodbMemoryServer from "mongodb-memory-server";
import Agenda from "agenda";
import config from "../../config/env";
import errorsDefinition from "../../config/errors-definition";
import { mockAnalysisApiCalls, mockKeycloakCalls } from "./mocks";

require("../../express-jsend");
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
  config.db.agenda = new Agenda({ db: { address: mongoUri } });
  require("../../workers");
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

mockAnalysisApiCalls();
mockKeycloakCalls();

export default { config, createApp };
