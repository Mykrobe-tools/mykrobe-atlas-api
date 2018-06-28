import nock from "nock";
import config from "../../../config/env";

const keycloakConfig = config.accounts.keycloak;
const realm = keycloakConfig.realm;
const tokenUrl = keycloakConfig.tokenUrl;
const adminSettings = keycloakConfig.admin;

// mock keycloak rest calls
const mockKeycloakCalls = () => {
  nock(adminSettings.baseUrl)
    .persist()
    .post(`/realms/${realm}/${tokenUrl}`, function(body) {
      return body.username && body.password;
    })
    .replyWithFile(200, __dirname + "/replies/auth.json", {
      "Content-Type": "application/json"
    });
};

const mocks = Object.freeze({
  mockKeycloakCalls
});

export default mocks;
