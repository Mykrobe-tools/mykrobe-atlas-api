import nock from "nock";
import uuid from "uuid";
import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch/";
import config from "../../src/config/env";

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
      return body.username && body.username !== "admin@nhs.co.uk" && body.password;
    })
    .replyWithFile(200, __dirname + "/replies/other-auth.json", {
      "Content-Type": "application/json"
    });
};

const mocks = Object.freeze({
  mockEsCalls,
  mockKeycloakCalls,
  mockThirdPartyCalls
});

export default mocks;
