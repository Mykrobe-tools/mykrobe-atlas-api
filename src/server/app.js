import express from "express";
import logger from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import methodOverride from "method-override";
import cors from "cors";
import expressWinston from "express-winston";
import helmet from "helmet";
import errors from "errors";
import httpStatus from "http-status";
import RateLimit from "express-rate-limit";
import addRequestId from "express-request-id";
import winstonInstance from "./modules/winston";
import routes from "./routes/index.route";
import config from "../config/env";
import APIError from "./helpers/APIError";
import AccountsHelper from "./helpers/AccountsHelper";
import { stubDevApis } from "../external";

const keycloak = AccountsHelper.keycloakInstance();

const createApp = ({ rateLimitReset, rateLimitMax, limit } = config.express) => {
  const app = express();

  if (config.env === "development") {
    stubDevApis();
    app.use(logger("dev"));
  }

  // parse body params and attache them to req.body
  app.use(bodyParser.json({ limit }));
  app.use(bodyParser.urlencoded({ limit, extended: true }));

  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());

  // secure apps by setting various HTTP headers
  app.use(helmet());

  // enable CORS - Cross Origin Resource Sharing
  app.use(cors());

  // Support request ids
  app.use(addRequestId());

  // Keycloak for account management
  app.use(keycloak.connect.middleware());
  app.use(keycloak.getUserMiddleware.bind(keycloak));

  // enable detailed API logging in dev env
  if (
    config.env === "development" ||
    (process.env.DEBUG && (process.env.DEBUG === "true" || process.env.DEBUG === "1"))
  ) {
    expressWinston.responseWhitelist.push("body");
    app.use(
      expressWinston.logger({
        winstonInstance,
        meta: true, // optional: log meta data about request (defaults to true)
        msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
        colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
      })
    );
  }
  // 1000 requests per 15 min
  const limiter = new RateLimit({
    windowMs: rateLimitReset,
    max: rateLimitMax,
    delayMs: 0, // disable delaying - full speed until the max limit is reached
    onLimitReached: (req, res) => {
      throw new APIError(
        "Too many requests, please try again later.",
        httpStatus.TOO_MANY_REQUESTS
      );
    }
  });
  // mount all routes on / path
  app.use("/", limiter, routes);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    // eslint-disable-line no-unused-vars
    const err = new APIError("Unknown API route.", httpStatus.NOT_FOUND);
    return res.jerror(err);
  });

  // return the rich jsend response.
  app.use((err, req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    return res.jerror(err);
  });

  if (config.env !== "test") {
    // log error in winston transports except when executing test suite
    app.use(
      expressWinston.errorLogger({
        winstonInstance
      })
    );
  }

  return app;
};

export default createApp;
