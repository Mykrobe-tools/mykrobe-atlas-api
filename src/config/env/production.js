export default {
  db: {
    uri: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${
      process.env.DB_SERVICE_HOST
    }:${process.env.DB_SERVICE_PORT}/atlas`
  },
  express: {
    uploadsLocation: process.env.UPLOADS_LOCATION,
    demoDataRootFolder: "/data"
  },
  accounts: {
    keycloak: {
      redirectUri: process.env.KEYCLOAK_REDIRECT_URI
    }
  }
};
