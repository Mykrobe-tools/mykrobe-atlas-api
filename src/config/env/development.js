export default {
  db: {
    uri: "mongodb://localhost/atlas-dev"
  },
  express: {
    uploadsLocation: "/tmp/uploads",
    demoDataRootFolder: "/data"
  },
  accounts: {
    keycloak: {
      redirectUri: "https://atlas-dev.makeandship.com/"
    }
  }
};
