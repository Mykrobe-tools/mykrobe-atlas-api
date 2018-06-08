import mongoose from "mongoose";
import MongodbMemoryServer from "mongodb-memory-server";
import monq from "monq";
import nock from "nock";
import _ from "lodash";
import config from "../../config/env";
import createApp from "../../config/express";
import errorsDefinition from "../../config/errors-definition";

require("../../express-jsend");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
let mongoServer;

errorsDefinition.create();

const filterRequestBody = body => {
  const data = JSON.parse(body);
  if (data.file.match(/333-08/)) {
    return { file: "success.json", sample_id: "1" };
  } else {
    return { file: "error.json", sample_id: "2" };
  }
};

nock(config.analysisApiUrl)
  .filteringRequestBody(body => filterRequestBody(body))
  .post("/analysis", { file: "success.json", sample_id: "1" })
  .reply(200, "OK");

nock(config.analysisApiUrl)
  .filteringRequestBody(body => filterRequestBody(body))
  .post("/analysis", { file: "error.json", sample_id: "2" })
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
  config.db = mongoUri;
  config.monqClient = monq(mongoUri);
  require("../../workers");
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

export default { config, createApp };
