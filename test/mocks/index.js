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

const mocks = Object.freeze({
  mockThirdPartyCalls
});

export default mocks;
