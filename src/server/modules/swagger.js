import swaggerJSDoc from "swagger-jsdoc";
import config from "../../config/env";

// swagger definition
const swaggerDefinition = {
  info: {
    title: "Atlas API",
    version: "1.0.0",
    description: "Atlas is an outbreak and resistance analysis platform"
  },
  host: config.apiBaseUrl,
  basePath: "/",
  schemes: ["https"],
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Pass a valid JWT token to access the API"
    }
  }
};

// options for the swagger docs
const swaggerOptions = {
  swaggerDefinition,
  apis: [config.swaggerApis]
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

const swagger = Object.freeze({
  swaggerSpec
});

export default swagger;
