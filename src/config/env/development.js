export default {
  db: {
    uri: "mongodb://localhost/atlas?replicaSet=rs0"
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
