import {} from "dotenv/config";
import mongoose from "mongoose";
import MongodbMemoryServer from "mongodb-memory-server";
import http from "http";
import mockserver from "mockserver";
import config from "../src/config/env";
import {
  enableExternalAtlasMockServices,
  enableExternalThirdPartyMockServices
} from "../src/external";

const createApp = require("../src/server/app");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
let mongoServer;

// mocked servers
// const elasticsearchMockServer = http.createServer(mockserver(`${__dirname}/mocks`));
// const keycloakMockServer = http.createServer(mockserver(`${__dirname}/mocks`));

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
  // elasticsearchMockServer.listen(config.elasticsearch.port);
  // keycloakMockServer.listen(config.accounts.keycloak.admin.port);
  done();
});

afterAll(async done => {
  // elasticsearchMockServer.close();
  // keycloakMockServer.close();
  done();
});

// Mock calls to Atlas Services
// enableExternalAtlasMockServices();

// Mock calls to External Services (e.g. Dropbox)
// enableExternalThirdPartyMockServices();

export default { config, createApp };
