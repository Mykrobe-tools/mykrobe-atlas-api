import _ from "lodash";
const mockedEsPort = _.random(10000, 65535);
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
  },
  services: {
    geo: {
      google: {
        apiKey: "AIzaSyA_xGtYZ8EouAFVlSjM5o5Iv3b7D_PBZsk" //"mock-google-geocoding-api-key"
      }
    },
    locationiq: {
      apiKey: "d1c26595029974"
    }
  }
};
