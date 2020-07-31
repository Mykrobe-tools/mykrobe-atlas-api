import winston from "winston";

import config from "../../config/env";

const logFormat = winston.format.printf(function(info) {
  if (info.meta) {
    return `${info.level}: ${JSON.stringify(info.meta, null, 4)}\n`;
  } else {
    return `${info.level}: ${info.message}`;
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
