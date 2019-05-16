import _ from "lodash";
const mockedEsPort = _.random(10000, 65535);
const mockedKeycloakPort = _.random(10000, 65535);

export default {
  db: {},
  elasticsearch: {
    port: mockedEsPort,
    index: "atlas",
    host: `http://localhost:9200`
  },
  express: {
    uploadsLocation: "/atlas/uploads",
    uploadMaxFileSize: 12000000
  },
  accounts: {
    keycloak: {
      admin: {
        port: mockedKeycloakPort,
        baseUrl: `http://localhost:${mockedKeycloakPort}/auth`
      }
    }
  }
};
