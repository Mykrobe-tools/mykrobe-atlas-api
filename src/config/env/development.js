export default {
  db: {
    uri: "mongodb://localhost/atlas-dev"
  },
  express: {
    uploadsLocation: "/tmp/uploads",
    demoDataRootFolder: process.env.DEMO_DATA_ROOT_FOLDER
  },
  accounts: {
    keycloak: {
      redirectUri: "https://atlas-dev.makeandship.com/"
    }
  }
};
