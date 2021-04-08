import _ from "lodash";

export default {
  db: {},
  elasticsearch: {
    port: 9200,
    index: "atlas",
    host: `http://localhost:9200`,
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
        port: 8080,
        baseUrl: `http://localhost:8080/auth`
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
