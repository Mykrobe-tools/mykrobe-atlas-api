export default {
  db: {
    uri: "mongodb://localhost/atlas-dev"
  },
  express: {
    uploadsLocation: "/tmp/uploads",
    demoDataRootFolder: "data",
    groupsLocation: "/tmp/groups.json"
  },
  accounts: {
    keycloak: {
      redirectUri: "https://atlas-dev.makeandship.com/"
    }
  }
};
