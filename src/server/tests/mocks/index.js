import nock from "nock";
import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch/";
import config from "../../../config/env";

// mock keycloak rest calls
const mockAnalysisApiCalls = () => {
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

const mocks = Object.freeze({
  mockAnalysisApiCalls,
  mockEsCalls
});

export default mocks;
