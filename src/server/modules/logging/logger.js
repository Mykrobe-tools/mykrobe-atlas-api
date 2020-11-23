import winston from "winston";

import LoggingUtil from "./LoggingUtil";

import config from "../../../config/env";

const logFormat = winston.format.printf(function(info) {
  if (LoggingUtil.isMetaMessage(info)) {
    return `${info.level}: ${JSON.stringify(LoggingUtil.safe(info.meta), null, 4)}\n`;
  } else {
    return `${info.level}: ${LoggingUtil.safe(info.message)}`;
  }
});

const logConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat)
    })
  ],
  level: config.logging.level
};
const logger = winston.createLogger(logConfig);

export default logger;
