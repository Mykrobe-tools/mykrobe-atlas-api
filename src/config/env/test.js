import _ from "lodash";
const mockedEsPort = process.env.SKIP_ES ? _.random(10000, 65535) : 9200;
const mockedKeycloakPort = _.random(10000, 65535);

export default {
  db: {},
  elasticsearch: {
    port: mockedEsPort,
    index: "atlas",
    host: `http://localhost:${mockedEsPort}`,
    log: "debug"
  },
  express: {
    uploadsLocation: "/atlas/uploads",
    uploadMaxFileSize: 12000000,
    demoDataRootFolder: process.env.DEMO_DATA_ROOT_FOLDER,
    groupsLocation: "test/fixtures/groups.json"
  },
  accounts: {
    keycloak: {
      admin: {
        port: mockedKeycloakPort,
        baseUrl: `http://localhost:${mockedKeycloakPort}/auth`
      }
    }
  },
  services: {
    geo: {
      google: {
        apiKey: "mock-google-geocoding-api-key"
      }
    }
  }
};
