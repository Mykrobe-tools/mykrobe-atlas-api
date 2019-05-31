import _ from "lodash";
const mockedEsPort = 9200; //_.random(10000, 65535);
const mockedKeycloakPort = _.random(10000, 65535);

export default {
  db: {},
  elasticsearch: {
    port: mockedEsPort,
    index: "atlas",
    host: `http://localhost:${mockedEsPort}`
  },
  express: {
    uploadsLocation: "/atlas/uploads",
    uploadMaxFileSize: 12000000,
    demoDataRootFolder: process.env.DEMO_DATA_ROOT_FOLDER
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
