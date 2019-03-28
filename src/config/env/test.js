import _ from "lodash";
const mockedEsPort = _.random(10000, 65535);
const mockedKeycloakPort = _.random(10000, 65535);

export default {
  mockedEsPort,
  mockedKeycloakPort,
  db: {},
  elasticsearch: {
    index: "atlas",
    host: `http://localhost:${mockedEsPort}`
  },
  express: {
    uploadsLocation: "/atlas/uploads",
    uploadMaxFileSize: 12000000
  },
  accounts: {
    keycloak: {
      admin: {
        baseUrl: `http://localhost:${mockedKeycloakPort}/auth`
      }
    }
  }
};
