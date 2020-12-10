import {} from "dotenv/config";
import mongoose from "mongoose";
import util from "util";
import config from "./config/env";
import createApp from "./server/app";
import logger from "./server/modules/logging/logger";

(async () => {
  // make bluebird default Promise
  Promise = require("bluebird"); // eslint-disable-line no-global-assign

  // plugin bluebird promise in mongoose
  mongoose.Promise = Promise;

  // connect to mongo db
  mongoose.set("useNewUrlParser", true);
  mongoose.set("useFindAndModify", false);
  mongoose.set("useCreateIndex", true);
  mongoose.set("useUnifiedTopology", true);
  mongoose.set("poolSize", 20);
  mongoose.connect(config.db.uri, { useNewUrlParser: true });
  mongoose.connection.on("error", () => {
    throw new Error(`unable to connect to database: ${config.db.uri}`);
  });

  // print mongoose logs in dev env
  if (config.db.MONGOOSE_DEBUG) {
    mongoose.set("debug", (collectionName, method, query, doc) => {
      logger.debug(
        `${collectionName}.${method} - ${util.inspect(query, false, 20)} - ${JSON.stringify(doc)}`
      );
    });
  }

  const app = await createApp();

  // module.parent check is required to support mocha watch
  // src: https://github.com/mochajs/mocha/issues/1912
  if (!module.parent) {
    // listen on port config.port
    app.listen(config.express.port, () => {
      logger.info(`Server started on port ${config.express.port} (${config.env})`);
    });
  }

  // enable reverse proxy support
  app.enable("trust proxy");
  // enable strong etag
  app.set("etag", "strong");
})();
