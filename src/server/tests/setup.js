import mongoose from "mongoose";
import MongodbMemoryServer from "mongodb-memory-server";
import nock from "nock";
import config from "../../config/env";
import createApp from "../../config/app";
import errorsDefinition from "../../config/errors-definition";
import Agenda from "agenda";

require("../../express-jsend");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
let mongoServer;

errorsDefinition.create();

nock(config.services.analysisApiUrl)
  .persist()
  .post("/analysis", function(body) {
    return body.file.endsWith("333-08.json");
  })
  .reply(200, "OK");

nock(config.services.analysisApiUrl)
  .persist()
  .post("/analysis", function(body) {
    return body.file.endsWith("333-09.json");
  })
  .reply(500, "ERROR");

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

export default { config, createApp };
