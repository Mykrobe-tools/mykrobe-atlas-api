import fs from "fs";

let username, password;
const path = "/vault/secrets/db-creds";

if (fs.existsSync(path)) {
  const data = fs.readFileSync(path, "UTF-8");
  // split the contents by new line
  const lines = data.split(/\r?\n/);

  lines.forEach(line => {
    if (line.startsWith("username:")) {
      username = line.split(":")[1].trim();
    } else if (line.startsWith("password:")) {
      password = line.split(":")[1].trim();
    }
  });
} else {
  username = process.env.MONGO_USER;
  password = process.env.MONGO_PASSWORD;
}

export default {
  db: {
    uri: `mongodb://${username}:${password}@${process.env.DB_SERVICE_HOST}:${process.env.DB_SERVICE_PORT}/atlas?replicaSet=${process.env.DB_RS_NAME}`
  },
  express: {
    uploadDir: process.env.UPLOAD_DIR,
    analysisApiDir: process.env.ANALYSIS_API_DIR,
    uploadsLocation: process.env.UPLOADS_LOCATION,
    uploadsTempLocation: process.env.UPLOADS_TEMP_LOCATION,
    demoDataRootFolder: process.env.DEMO_DATA_ROOT_FOLDER,
    rateLimitReset: 1 * 60 * 1000,
    swaggerApis: process.env.SWAGGER_API_FILES,
    corsOptions: {
      origin: process.env.CORS_ORIGIN,
      optionsSuccessStatus: 200
    },
    groupsLocation: process.env.GROUPS_LOCATION
  },
  accounts: {
    keycloak: {
      redirectUri: process.env.KEYCLOAK_REDIRECT_URI
    }
  }
};
