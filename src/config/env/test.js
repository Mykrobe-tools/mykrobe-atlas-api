import _ from "lodash";
const esPort = 9200;
const mockedKeycloakPort = _.random(10000, 65535);

export default {
  db: {},
  elasticsearch: {
    port: esPort,
    index: "atlas",
    host: `http://localhost:${esPort}`,
    log: "info"
  },
  express: {
    uploadsLocation: "/atlas/uploads",
    analysisApiDir: "/atlas/data",
    uploadMaxFileSize: 12000000,
    demoDataRootFolder: process.env.DEMO_DATA_ROOT_FOLDER,
    groupsLocation: "test/fixtures/groups/init.json"
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
