import nock from "nock";
import uuid from "uuid";
import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch/";
import config from "../../../config/env";

// mock keycloak rest calls
const mockAnalysisApiCalls = () => {
  nock(config.services.analysisApiUrl)
    .persist()
    .post("/analyses", body => body.file.endsWith("333-08.json"))
    .reply(200, {
      result: "success",
      task_id: "1447d80f-ca79-40ac-bc5d-8a02933323c3"
    });

  nock(config.services.analysisApiUrl)
    .persist()
    .post("/analyses", body => body.file.endsWith("333-09.json"))
    .reply(500, { result: "error" });
};

const mockDistanceApiCalls = () => {
  nock(config.services.analysisApiUrl)
    .persist()
    .post("/distance")
    .reply(200, {
      result: "success",
      task_id: "3a9ba217-4ccb-4108-9c01-60525e2ca905"
    });
};

const mockSearchApiCalls = () => {
  nock(config.services.analysisApiUrl)
    .persist()
    .post("/search", body => body.user_id !== "56c787ccc67fc16ccc1a5e92")
    .reply(200, {
      result: "success",
      task_id: uuid.v1()
    });

  nock(config.services.analysisApiUrl)
    .persist()
    .post("/search", body => body.user_id === "56c787ccc67fc16ccc1a5e92")
    .reply(500, { result: "error" });
};

const mockDevApiCalls = () => {
  nock(config.services.analysisApiUrl)
    .persist()
    .post(/\bsearch|\banalyses/g)
    .reply(200, {
      result: "success",
      task_id: uuid.v1()
    });
};

// mock third party calls
const mockThirdPartyCalls = () => {
  nock("https://dl.dropboxusercontent.com")
    .persist()
    .replyContentLength()
    .get("/1/view/1234")
    .reply(200, { chunk: "lorem ipsum" });
};

// mock elasticsearch calls
const mockEsCalls = () => {
  ElasticsearchHelper.search = jest.fn(() => {
    return {
      took: 0,
      timed_out: false,
      _shards: { total: 5, successful: 5, skipped: 0, failed: 0 },
      hits: { total: 0, max_score: null, hits: [] }
    };
  });

  ElasticsearchHelper.deleteIndexIfExists = jest.fn(() => true);
  ElasticsearchHelper.createIndex = jest.fn(() => true);
  ElasticsearchHelper.indexDocument = jest.fn(() => true);
  ElasticsearchHelper.deleteDocument = jest.fn(() => true);
  ElasticsearchHelper.updateDocument = jest.fn(() => true);
  ElasticsearchHelper.indexDocuments = jest.fn(() => true);
  ElasticsearchHelper.aggregate = jest.fn(() => true);
  ElasticsearchHelper.getClient = jest.fn(() => true);
};

const keycloakConfig = config.accounts.keycloak;
const realm = keycloakConfig.realm;
const tokenUrl = keycloakConfig.tokenUrl;
const adminSettings = keycloakConfig.admin;

// mock keycloak rest calls
const mockKeycloakCalls = () => {
  nock(adminSettings.baseUrl)
    .persist()
    .post(`/realms/${realm}/${tokenUrl}`, function(body) {
      return body.username === "admin@nhs.co.uk" && body.password;
    })
    .replyWithFile(200, __dirname + "/replies/admin-auth.json", {
      "Content-Type": "application/json"
    });

  nock(adminSettings.baseUrl)
    .persist()
    .post(`/realms/${realm}/${tokenUrl}`, function(body) {
      return (
        body.username && body.username !== "admin@nhs.co.uk" && body.password
      );
    })
    .replyWithFile(200, __dirname + "/replies/other-auth.json", {
      "Content-Type": "application/json"
    });
};

const mocks = Object.freeze({
  mockAnalysisApiCalls,
  mockEsCalls,
  mockKeycloakCalls,
  mockDevApiCalls,
  mockDistanceApiCalls,
  mockThirdPartyCalls,
  mockSearchApiCalls
});

export default mocks;
