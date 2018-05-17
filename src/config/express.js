import express from "express";
import logger from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import methodOverride from "method-override";
import cors from "cors";
import expressWinston from "express-winston";
import expressValidation from 'express-validation';
import helmet from "helmet";
import errors from "errors";
import httpStatus from "http-status";
import RateLimit from "express-rate-limit";
import addRequestId from "express-request-id";
import winstonInstance from "./winston";
import routes from "../server/routes/index.route";
import config from "./env";
import APIError from "../server/helpers/APIError";

const createApp = ({ rateLimitReset, rateLimitMax } = config) => {
  const app = express();

  if (config.env === "development") {
    app.use(logger("dev"));
  }

  // parse body params and attache them to req.body
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());

  // secure apps by setting various HTTP headers
  app.use(helmet());

  // enable CORS - Cross Origin Resource Sharing
  app.use(cors());

  // Support request ids
  app.use(addRequestId());

  // enable detailed API logging in dev env
  if (config.env === "development") {
    expressWinston.responseWhitelist.push("body");
    app.use(
      expressWinston.logger({
        winstonInstance,
        meta: true, // optional: log meta data about request (defaults to true)
        msg:
          "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
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
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (err instanceof expressValidation.ValidationError) {
      // validation error contains errors which is an array of error each containing message[]
      const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
      const error = new errors.ValidationError(unifiedErrorMessage);
      return res.jerror(error);
    }
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
