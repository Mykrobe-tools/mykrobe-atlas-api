export default {
  db: {
    uri: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${
      process.env.DB_PORT_27017_TCP_ADDR
    }/atlas`
  },
  express: {
    uploadsLocation: process.env.UPLOADS_LOCATION
  },
  accounts: {
    keycloak: {
      redirectUri: process.env.KEYCLOAK_REDIRECT_URI
    }
  }
};
