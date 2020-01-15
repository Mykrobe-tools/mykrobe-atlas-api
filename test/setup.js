import {} from "dotenv/config";
import mongoose from "mongoose";
import MongodbMemoryServer from "mongodb-memory-server";
import http from "http";
import mockserver from "mockserver";
import config from "../src/config/env";
import errorsDefinition from "../src/config/errors-definition";
import { mockThirdPartyCalls } from "./mocks";
import {
  stubTreeApi,
  stubIsolateIdMapping,
  stubAnalysisApi,
  stubDistanceApi,
  stubSearchApi
} from "../src/external";

jest.mock("../src/server/modules/agenda");
const createApp = require("../src/server/app");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
let mongoServer;

errorsDefinition.create();

// mocked servers
const elasticsearchMockServer = http.createServer(mockserver(`${__dirname}/mocks`));
const keycloakMockServer = http.createServer(mockserver(`${__dirname}/mocks`));

beforeAll(async done => {
  mongoServer = new MongodbMemoryServer({
    instance: {
      dbName: "atlas-test"
    },
    binary: {
      version: "3.6.1",
      ssl: true,
      downloadDir: "./tmp/mongo"
    }
  });
  const mongoUri = await mongoServer.getConnectionString();
  await mongoose.connect(mongoUri, {}, err => {
    if (err) console.error(err);
  });

  config.db.uri = mongoUri;
  elasticsearchMockServer.listen(config.elasticsearch.port);
  keycloakMockServer.listen(config.accounts.keycloak.admin.port);
  done();
});

afterAll(async done => {
  elasticsearchMockServer.close();
  keycloakMockServer.close();
  done();
});

// stubs
stubTreeApi();
stubIsolateIdMapping();
stubAnalysisApi();
stubDistanceApi();
stubSearchApi();

// mocks
mockThirdPartyCalls();

export default { config, createApp };
