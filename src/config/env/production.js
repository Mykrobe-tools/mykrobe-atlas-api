export default {
  db: {
    uri: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.DB_SERVICE_HOST}:${process.env.DB_SERVICE_PORT}/atlas?replicaSet=${process.env.DB_RS_NAME}`
  },
  express: {
    uploadDir: process.env.UPLOAD_DIR,
    uploadsLocation: process.env.UPLOADS_LOCATION,
    uploadsTempLocation: process.env.UPLOADS_TEMP_LOCATION,
    demoDataRootFolder: process.env.DEMO_DATA_ROOT_FOLDER,
    rateLimitReset: 1 * 60 * 1000,
    swaggerApis: process.env.SWAGGER_API_FILES
  },
  accounts: {
    keycloak: {
      redirectUri: process.env.KEYCLOAK_REDIRECT_URI
    }
  }
};
