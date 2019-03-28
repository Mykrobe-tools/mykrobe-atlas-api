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
  mockKeycloakCalls,
  mockThirdPartyCalls
});

export default mocks;
