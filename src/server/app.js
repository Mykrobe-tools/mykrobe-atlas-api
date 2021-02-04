import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import methodOverride from "method-override";
import cors from "cors";
import expressWinston from "express-winston";
import helmet from "helmet";
import httpStatus from "http-status";
import RateLimit from "express-rate-limit";
import addRequestId from "express-request-id";

import { ErrorUtil, APIError } from "makeandship-api-common/lib/modules/error";
import {
  ExpressInitializer,
  JsendInitializer
} from "makeandship-api-common/lib/modules/express/initializers";
import GroupsInitializer from "./initializers/GroupsInitializer";

import Constants from "./Constants";

import logger from "./modules/logging/logger";
import routes from "./routes/index.route";
import config from "../config/env";

import AccountsHelper from "./helpers/AccountsHelper";
import { enableExternalAtlasMockServices } from "../external";

const keycloak = AccountsHelper.keycloakInstance();

const createApp = async options => {
  logger.debug(`createApp: enter`);
  const settings = Object.assign(config.express, options);
  const { rateLimitReset, rateLimitMax, limit, corsOptions = {} } = settings;

  const app = express();
  logger.debug(`createApp: express generated`);
  if (config.env === "development") {
    // enable analysis API services
    // enableExternalAtlasMockServices();
  }

  // parse body params and attached them to req.body
  app.use(bodyParser.json({ limit }));
  app.use(bodyParser.urlencoded({ limit, extended: true }));

  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());

  // secure apps by setting various HTTP headers
  app.use(helmet());

  // enable CORS - Cross Origin Resource Sharing
  app.use(cors(corsOptions));

  // Support request ids
  app.use(addRequestId());

  logger.debug(`createApp: Services configured`);

  // Keycloak for account management
  console.log(keycloak.connect);
  app.use(keycloak.connect.middleware());
  console.log(keycloak.getUserMiddleware);
  app.use(keycloak.getUserMiddleware.bind(keycloak));

  logger.debug(`createApp: Keycloak middleware configured`);

  // logging - true, 1 or "1"
  const isDebug = !!process.env.DEBUG;

  const requestWhitelist = isDebug
    ? ["url", "headers", "method", "httpVersion", "originalUrl", "query", "body"]
    : ["method", "url", "query"];
  const responseWhitelist = isDebug
    ? ["statusCode", "responseTime", "body"]
    : ["statusCode", "responseTime"];
  const meta = isDebug;

  app.use(
    expressWinston.logger({
      winstonInstance: logger,
      meta, // optional: log meta data about request (defaults to true)
      msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
      colorStatus: true, // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
      requestWhitelist,
      responseWhitelist,
      bodyBlacklist: ["password", "confirmPassword"],
      headerBlacklist: ["authorization"],
      ignoreRoute: req => {
        return /health-check/.test(req.url);
      }
    })
  );

  logger.debug(`createApp: Logging middleware configured`);

  // 1000 requests per 15 min
  // const limiter = new RateLimit({
  //   windowMs: rateLimitReset,
  //   max: rateLimitMax,
  //   delayMs: 0, // disable delaying - full speed until the max limit is reached
  //   onLimitReached: (req, res) => {
  //     throw new APIError(
  //       Constants.ERRORS.API_ERROR,
  //       "Too many requests, please try again later.",
  //       null,
  //       httpStatus.TOO_MANY_REQUESTS
  //     );
  //   }
  // });
  // mount all routes on / path
  // app.use("/", limiter, routes);
  app.use("/", routes);

  logger.debug(`createApp: Rate limited configured`);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    // eslint-disable-line no-unused-vars
    const err = new APIError(
      Constants.ERRORS.ROUTE_NOT_FOUND,
      "Unknown API route",
      null,
      httpStatus.NOT_FOUND
    );
    return res.jerror(err);
  });

  logger.debug(`createApp: Error handler configured`);

  // return the rich jsend response.
  app.use((err, req, res, next) => {
    res.header("Access-Control-Allow-Origin", corsOptions.origin || "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (err.errors) {
      return res.jerror(ErrorUtil.convert(err, Constants.ERRORS.VALIDATION_ERROR));
    }
    return res.jerror(err);
  });

  if (config.env !== "test") {
    // log error in winston transports except when executing test suite
    app.use(
      expressWinston.errorLogger({
        winstonInstance: logger
      })
    );
  }

  logger.debug("ExpressInitializer#initialize: Initializing ...");
  const initializer = new ExpressInitializer(express);
  logger.debug(`1`);
  initializer.add(new JsendInitializer());
  logger.debug(`2`);
  //initializer.add(new GroupsInitializer());
  logger.debug(`3`);
  await initializer.initialize();
  logger.debug("ExpressInitializer#initialize: Initialization complete");

  return app;
};

export default createApp;
